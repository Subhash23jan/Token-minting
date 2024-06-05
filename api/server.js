const express = require('express')
const multer = require('multer')
const cors = require('cors');
const axios = require('axios')
const app = express()
const port=process.env.PORT || 5000

app.use(express.json())

const upload = multer({
    limits:{
        fileSize:1000000
    }
})

const starton = axios.create({
    baseURL: "https://api.starton.io/v3",
    headers: {
        "x-api-key": "sk_live_675052c2-8fb3-49ea-9004-35c6803c6bde",
    },
  })

app.get('/',(req,res)=>{
    res.send('Hello World')
});
app.post('/upload', cors(), upload.single('file'), async (req, res) => {
    try {
        console.log(req.file);
        let data = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        data.append("file", blob, { filename: req.file.originalname })
        data.append("isSync", "true");

        async function uploadImageOnIpfs() {
            const ipfsImg = await starton.post("/ipfs/file", data, {
                headers: { "Content-Type": `multipart/form-data; boundary=${data._boundary}` },
            })
            console.log('Image uploaded to IPFS:', ipfsImg.data);
            return ipfsImg.data;
        }

        async function uploadMetadataOnIpfs(imgCid) {
            const metadataJson = {
                name: `A Wonderful NFT`,
                description: `Probably the most awesome NFT ever created !`,
                image: `https://ipfs.io/ipfs/${imgCid}`,
            }
            const ipfsMetadata = await starton.post("/ipfs/json", {
                name: "My NFT metadata Json",
                content: metadataJson,
                isSync: true,
            });
            console.log('Metadata uploaded to IPFS:', ipfsMetadata.data);
            return ipfsMetadata.data;
        }

        const SMART_CONTRACT_NETWORK = "polygon-zkevm-cardona";
        const SMART_CONTRACT_ADDRESS = "0x152aA69e9Ca5595B86713922380DCfFab193f983";
        const WALLET_IMPORTED_ON_STARTON = "0x5cBFd477521BB2ac0D6914fD30236d62F584E897";

        async function mintNFT(receiverAddress, metadataCid) {
            const nft = await starton.post(`/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`, {
                functionName: "mint",
                signerWallet: WALLET_IMPORTED_ON_STARTON,
                speed: "low",
                params: [receiverAddress, metadataCid]
            });
            console.log('NFT minting response:', nft.data);
            return nft.data;
        }

        const RECEIVER_ADDRESS = "0xb5cB0Cce23E7bdEC4E2CE53E9Fd1d877dc53a8c4";
        const ipfsImgData = await uploadImageOnIpfs();
        const ipfsMetadata = await uploadMetadataOnIpfs(ipfsImgData.cid);
        const nft = await mintNFT(RECEIVER_ADDRESS, ipfsMetadata.cid);
        console.log('NFT minted:', nft);

        res.status(201).json({
            transactionHash: nft.transactionHash,
            cid: ipfsImgData.cid
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  app.listen(port,()=>{
    console.log('Server is running on port '+ port);
  })