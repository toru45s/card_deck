// import React, { useState } from 'react'
// import { Grid, TextField, Button } from '@material-ui/core'
// import { Alert } from '@material-ui/lab';

// function Setting() {

//     const [note,setNote] = useState('')
//     const [error,setError] = useState('')
//     const [sucessAlert,setSucessAlert] = useState('')
//     const handleChange = (e) => {
//         if(e.target.value.length >= 100)return;
//         setNote(e.target.value.trimStart())
//         setError('')
//     }

//     const handleSubmit = () => {
//         if(note.length < 1){
//             setError('Please enter note')
//             return;
//         }
//         let obj = {
//             note: note,
//             isNote: true
//         }
//         localStorage.setItem('note', JSON.stringify(obj))
//         setSucessAlert('Note added successfully')
//        setTimeout(() => {
//         setSucessAlert('')
//          }, 2000);
//         setNote('')
//     }

//   return (
//     <div>
//         <div className="coupon-code-box">
//      <h3 className="heading-h3" style={{marginBottom: '10px'}}>
//             Add Note
//     </h3>
//     <p className='p4' style={{marginBottom: 30}}>Enter message for cart page</p>
//    {sucessAlert && <Alert severity="success" className='alert-right'>{sucessAlert}</Alert>}
//       <Grid container item xs={12} spacing={0}>
//             <TextField className='w-100' id="outlined-basic" value={note} onChange={handleChange} label="Add Note" variant="outlined"  />
//             {error && <span className='error' style={{color:"red"}}>{error}</span>}
//       </Grid>
//             <Button variant="contained" color="primary" onClick={()=>handleSubmit()} style={{marginTop: '20px'}}>Submit</Button>
//       </div>
//     </div>
//   )
// }

// export default Setting
