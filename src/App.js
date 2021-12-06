import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import MZ from './assets/mz.gif';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import { ethers } from 'ethers';
import myEpicGame from './utils/MyEpicGame.json';

import LoadingIndicator from './Components/LoadingIndicator';



// Constants
const TWITTER_HANDLE = 'rrmdp';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;



const App = () => {

   /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const [gameContract, setGameContract] = useState(null);

  const [isLoading, setIsLoading] = useState(false);


 /*
   * Start by creating a new action that we will run on component load
   */
  // Actions
  const checkIfWalletIsConnected = async () => {
    /*
     * First make sure we have access to window.ethereum
     */

    try{
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
         setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        /*
         * Check if we're authorized to access the user's wallet
         */
        const accounts = await ethereum.request({ method: 'eth_accounts' });

       /*
         * User can have multiple authorized accounts, we grab the first one if its there!
         */
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
      }catch(error) {
        console.log(error);
      }
       setIsLoading(false);
  };



  const renderContent = () => {

    if (isLoading) {
    return <LoadingIndicator />;
    }
  
 /*
   * Scenario #1
   */
  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src={MZ}
          alt="MZ Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );
    /*
     * Scenario #2
     */
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
  } else if (currentAccount && characterNFT) {
    return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
  }
    

  };

 /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

 /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
  /*
   * The function we will call that interacts with out smart contract
   */
  const fetchNFTMetadata = async () => {
    console.log('Checking for Character NFT on address:', currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer
    );



    try {
      const txn = await gameContract.checkIfUserHasNFT();
    
      if (txn.name) {
      
        console.log('User has character NFT');

     // console.log(txn.hp.toNumber())

        
        if (txn.hp.toNumber() > 0 ) {
          setCharacterNFT(transformCharacterData(txn));
       console.log('txn is:');     
    //console.log(gameContract);      
//console.log(`${OPENSEA}`);
          


          }
      } else {
        console.log('No character NFT found');
      }
    } catch(error) {
      alert('Probably you are in the wrong Network, it should be Rinkeby Test Network, check your wallet settings.');
    }

    /*
     * Once we are done with all the fetching, set loading state to false
     */
    setIsLoading(false);
  };

  /*
   * We only want to run this, if we have a connected wallet
   */
  if (currentAccount) {
    console.log('CurrentAccount:', currentAccount);
    fetchNFTMetadata();
  }
  
}, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🤖 Kill the Boss 🤖</p>
          <p className="sub-text">Team up to fight the Boss!</p>
          {currentAccount && (
            <div className="accounts">
              {currentAccount}
            </div>
          )}
          <div className="connect-wallet-container">
            
          
            {renderContent()}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
