import {useState} from "react";
const FileUpload=()=>{
const [file,setFile]=useState(null);
const [cid,setCid]=useState("");
const [transaction,setTransaction]=useState("");
const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (!data.cid || !data.transactionHash) {
                throw new Error('Incomplete data received');
            }
            setCid(data.cid);
            setTransaction(data.transactionHash);
            console.log(data.cid);
            console.log(data.transactionHash);
        }
    } catch (error) {
        alert(error.message);
    }
}

 const retrieveFile=(event)=>{
        try{
            const data = event.target.files[0];
            console.log('file picked');
            setFile(data);
            event.preventDefault();
        }catch(error){
            alert("Retrieve File Does Not Worked");
        }
}
return (
    <>
      <div className="img-ctr">
        {cid ? (
           <a href={`https://${cid}.ipfs.dweb.link`}><img src={`https://${cid}.ipfs.dweb.link`} height={"250px"} /></a>
        ) : (
          <p>No CID available</p>
        )}
      </div>
      <div className="transaction">
        {transaction ? (
          <a href={`https://cardano-zkevm.polygonscan.com/tx/${transaction}`}>Transaction Details</a>
        ) : (
          <p>No transaction available</p>
        )}
      </div>
      <div className="form">
        <form onSubmit={handleSubmit}>
          <input type="file" className="choose" onChange={retrieveFile} />
          <button type="submit" className="btn">NFT Minter</button>
        </form>
      </div>
    </>
  );
  
}
export default FileUpload;