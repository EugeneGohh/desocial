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
      <div className="flex flex-col">
        <h1 className="font-mono subpixel-antialiased font-semibold">
          Welcome to DeSocial. Please connect your Matemask wallet!
        </h1>

        <br />
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
    <>
      <div className="flex flex-col">
        <div className="subpixel-antialiased font-semibold text-center mb-2">
          👋 Hey there!
        </div>

        <div className="my-5 form-control">
          <form onSubmit={handleSubmit}>
            <label className="label">
              <span className="label-text">Drop your message here:</span>
            </label>

            <div className="flex space-x-1">
              <input
                type="text"
                placeholder="Search"
                className="w-full input input-primary input-bordered"
                value={text}
                onChange={handleChange}
              />
              <button
                type="submit"
                value="Submit"
                onClick={message}
                className="btn btn-primary"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        <div>
          <button
            onClick={getAllMessages}
            className="btn btn-secondary btn-md btn-active"
            role="button"
            aria-pressed="true"
          >
            Get all messages
          </button>
        </div>
      </div>

      <div className="divider" />

      <div className="grid grid-cols-4 gap-4">
        {allMessages.map((message, index) => {
          return (
            <div
              key={index}
              className="card w-72 card-bordered card-compact lg:card-normal shadow-lg m-5"
            >
              <div className="card-body">
                <div className="card-title">Address: {message.address}</div>
                <p>Time: {message.timestamp.toString()}</p>
                <p>Message: {message.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Header;
