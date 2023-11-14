import React, { useEffect, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { Link, useHistory } from 'react-router-dom';
import { CreateButton, } from 'react-admin';
import globalRequestAxios from '../../../GlobalModules/globalRequestAxios';
import { Alert } from '@material-ui/lab';
import Cookies from 'js-cookie';

// EditButton, DeleteButton

const CouponList = () => {

  const [alert, setAlert] = useState('');
  let [deleteId, setDeleteId] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  const [couponsData, setCouponsData] = React.useState([]);
  const token = Cookies.get('token');

  const [order_by, set_order_by] = useState("");
  const [sort_by, set_sort_by] = useState("");

  const openDeleteModalWindow = (_id) => {
    deleteId = _id;
    setDeleteId(deleteId);
    document.getElementById("deleteModal").style.display="flex"
  }
  const closeWindow = () => {
      document.getElementById("deleteModal").style.display="none"
  }

  const history = useHistory();

  const changeOrderBy = (order, value) => {
    if (order === 1) set_order_by(1);
    else if (order === -1) set_order_by(-1);
    set_sort_by(value);
  };
  

  let getData = ()=>{
    globalRequestAxios('get','',`getAllCoupon?sortby=${sort_by}&sorttype=${order_by}`,'',token).then((res) => {
     setCouponsData(res);
     console.log("res",res)
 }).catch((err) => {
     console.log(err);
 })
}


useEffect(() => { 
  getData();
}, [order_by, sort_by]);


const handleDelete = (row) => {
  console.log("row",row)
  const formData = new FormData();
  formData.append('code', deleteId);
    globalRequestAxios('post',formData,'deleteCoupon','',token).then((res) => {
        // console.log("res",res)
        setAlert(res?.message);
                setShowAlert(true);
                setTimeout(() => { 
                  setShowAlert(false);
              }, 1000);
        getData();
        closeWindow()
    }).catch((err) => {
        console.log(err);
    })
}


  return (
    <div>
        <div className='heading-top-list'>
            <h3 className='h3'>Coupon List</h3>

            <CreateButton
                component={Link}
                to={{
                    pathname: "/coupon/create",
                }}
                label="Add Coupon"
            >
            </CreateButton>
            {/* <Button variant="contained" size="medium" color="primary" onClick={()=>history.push("/coupon-add")}>Add Coupon</Button> */}
        </div>
      <TableContainer component={Paper}>
      <Table aria-label="simple table" >
      {showAlert && <Alert severity="success" className='alert-right'>{alert}</Alert>}

        <TableHead >
          <TableRow>
            <TableCell>
              <div className='sort-div'> Deck Name
                <div className='sort-icon'>
                  <img src={require('../../img/caret-up.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(1, "deck_name")
                  }} />
                  <img src={require('../../img/caret-down.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(-1, "deck_name")
                  }}/>
                </div>
              </div>
            </TableCell>
            <TableCell align="left">
            <div className='sort-div'>Coupon Name
            <div className='sort-icon'>
                  <img src={require('../../img/caret-up.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(1, "codeName")
                  }} />
                  <img src={require('../../img/caret-down.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(-1, "codeName")
                  }} />
                </div>
              </div>
            </TableCell>
            <TableCell align="left">
              <div className='sort-div'>Coupon Code
            <div className='sort-icon'>
                  <img src={require('../../img/caret-up.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(1, "code")
                  }} />
                  <img src={require('../../img/caret-down.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(-1, "code")
                  }} />
                </div>
              </div>
            </TableCell>
            <TableCell align="left">
              <div className='sort-div'>Start Date
            <div className='sort-icon'>
                  <img src={require('../../img/caret-up.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(1, "start_date")
                  }} />
                  <img src={require('../../img/caret-down.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(-1, "start_date")
                  }} />
                </div>
              </div>
            </TableCell>
            <TableCell align="left">
              <div className='sort-div'>End Date
            <div className='sort-icon'>
                  <img src={require('../../img/caret-up.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(1, "expiry_date")
                  }} />
                  <img src={require('../../img/caret-down.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(-1, "expiry_date")
                  }} />
                </div>
              </div>
            </TableCell>
            <TableCell align="center">
              <div className='sort-div'>Number Of Coupon
            <div className='sort-icon'>
                  <img src={require('../../img/caret-up.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(1, "number_of_coupons")
                  }} />
                  <img src={require('../../img/caret-down.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(-1, "number_of_coupons")
                  }} />
                </div>
              </div>
            </TableCell>
            <TableCell align="center">
              <div className='sort-div'>Reduction%
            <div className='sort-icon'>
                  <img src={require('../../img/caret-up.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(1, "reduction")
                  }} />
                  <img src={require('../../img/caret-down.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(-1, "reduction")
                  }} />
                </div>
              </div>
            </TableCell>          
              <TableCell align="center">
              <div className='sort-div'>Coupon used
            <div className='sort-icon'>
                  <img src={require('../../img/caret-up.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(1, "used_count")
                  }} />
                  <img src={require('../../img/caret-down.png')} alt='sort' className='arrow-icon' onClick={()=>{
                    changeOrderBy(-1, "used_count")
                  }} />
                </div>
              </div>
            </TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(couponsData) && couponsData && couponsData.map((row) => {
          return  <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row?.deck_name}
              </TableCell>
              <TableCell align="left">{row?.codeName}</TableCell>
              <TableCell align="left">{row?.code}</TableCell>
              <TableCell align="left">
                {new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).format(new Date(row.start_date))}
              </TableCell>

              <TableCell align="left">
                {new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).format(new Date(row.expiry_date))}
              </TableCell>
              
              <TableCell align="center">{row?.number_of_coupons}</TableCell>
              <TableCell align="center">{row?.reduction}</TableCell>
              <TableCell align="center">{row?.transactions.length}</TableCell>
              <TableCell align="center">
                <div className='d-flex'>
                  {/* <Link to={`/coupon/edit`} > */}
                    <EditIcon  onClick={()=>{
                  localStorage.setItem('couponDataid',(row?._id));
                  history.push({
                    pathname: `/coupon/edit`,
                    // state: { couponData: row }

                  });
                }} className='icon24' />
                  {/* </Link> */}
                  <DeleteIcon
                   onClick={()=>openDeleteModalWindow(row?._id)} 
                    // onClick={()=>{handleDelete(row)}}
                   className='icon24' color="error" />
                </div>
              </TableCell>
            </TableRow>
          })}
        </TableBody>
      </Table>
    </TableContainer>

    <div className="modal-wrapper" id="deleteModal" >                
        <div id="shop_window_new"  >
            <div className='close-icon' onClick={()=>closeWindow()}>&times;</div>
            <h3>Are You sure You want to delete this coupon?</h3>
            <div className='flex modal-btn-flex'>
              <Button variant="outlined" size="large" color="primary"  onClick={()=>closeWindow()}>No</Button>
              <Button variant="contained" size="large" color="primary" onClick={()=>handleDelete(deleteId)}>Yes</Button>
            </div>
        </div>        
    </div>
   
    </div>
  )
}

export default CouponList
