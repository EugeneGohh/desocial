import React, { useState, useEffect } from "react";
import Connect from "./Connect";
import { useWeb3 } from "@3rdweb/hooks";
import { ethers } from "ethers";
import abi from "../utils/Message.json";

function Header() {
  const { address, chainId, provider } = useWeb3();
  const [allMessages, setAllMessages] = useState([]);
  const [text, setText] = useState("");
  const contractAddress = "0x0fa60f0041BDA25D9DD4fF51f1575FB2c92f9958";
  const contractABI = abi.abi;

  // Listen for events
  useEffect(() => {
    let messageContract;

    const onNewMessage = (from, timestamp, message) => {
      console.log("NewMessage", from, timestamp, message);
      setAllMessages((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      messageContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      messageContract.on("NewMessage", onNewMessage);
    }

    return () => {
      if (messageContract) {
        messageContract.off("NewMessage", onNewMessage);
      }
    };
  }, [contractABI]);

  if (!address) {
    return (
      <div>
        <h1>Welcome to DeSocial. Please connect your Matemask wallet!</h1>
        <Connect />
      </div>
    );
  }

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmit = (e) => {
    console.log(`Submitting ${text}`);
    e.preventDefault();
    e.target.reset();
  };

  const message = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messageContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await messageContract.getTotalMessages();
        console.log("Retrieved total messages count...", count.toNumber());

        /*
         * Execute the actual message from smart contract
         */
        const messageTxn = await messageContract.message(text, {
          gasLimit: 300000,
        });
        console.log("Mining...", messageTxn.hash);

        await messageTxn.wait();
        console.log("Mined -- ", messageTxn.hash);

        count = await messageContract.getTotalMessages();
        console.log("Retrieved total message count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* New method to get all messages from smart contract */
  const getAllMessages = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messageContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const messages = await messageContract.getAllMessages();

        /* Only select address, timestamp, and message */
        let messagesCleaned = [];
        messages.forEach((message) => {
          messagesCleaned.push({
            address: message.messageFrom,
            timestamp: new Date(message.timestamp * 1000),
            message: message.message,
          });
        });

        /* Store in React state */
        setAllMessages(messagesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div>👋 Hey there!</div>

      <div>
        <form onSubmit={handleSubmit}>
          <label>
            Drop your message here:
            <input type="text" value={text} onChange={handleChange} />
          </label>
          <input type="submit" value="Submit" onClick={message} />
        </form>
      </div>

      <div>
        <button onClick={getAllMessages}>Get all messages</button>
      </div>

      {allMessages.map((message, index) => {
        return (
          <div key={index}>
            <div>Address: {message.address}</div>
            <div>Time: {message.timestamp.toString()}</div>
            <div>Message: {message.message}</div>
          </div>
        );
      })}
    </div>
  );
}

export default Header;
