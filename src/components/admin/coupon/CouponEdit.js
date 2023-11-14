
import React, { Component, useEffect, useState } from 'react';
import {Grid, TextField, Button,FormControl,InputLabel,Select,MenuItem} from "@material-ui/core";

import './coupon.css';
import globalRequestAxios from '../../../GlobalModules/globalRequestAxios';
import uploadDataProvider, { httpClient } from '../DataProvider';
import { useHistory, useLocation } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import Cookies from 'js-cookie';


  const CouponEdit = () => {

    
    const [minDate, setMinDate] = useState("");
    const [minDateEnd, setMinDateEnd] = useState("");
    const [maxDate, setMaxDate] = useState("");
    const [decksData, setDecksData] = useState([]);
    const [alert, setAlert] = useState('');
    const [errAlert, setErrAlert] = useState('');
    const [showErrAlert, setShowErrAlert] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [deckName, setDeckName] = useState('');
    const [all_Deck, setAll_Deck] = useState('');
    const [coupon_name, setCoupon_name] = useState('');
    const [coupon_code, setCoupon_code] = useState('');
    let [start_date, setStart_date] = useState('');
    let [end_date, setEnd_date] = useState('');
    const [number_of_coupons, setNumber_of_coupons] = useState('');
    const [number_of_coupons_used ,setNumber_of_coupons_used] = useState('');
    const [reduction, setReduction] = useState('');
    const token = Cookies.get('token');


    //Error
    const [isErr, setIsErr] = useState(false);
    const[errMsg,setErrMsg]=useState('');
    const [deckNameErr, setDeckNameErr] = useState(null);
    const [coupon_nameErr, setCoupon_nameErr] = useState('');
    const [coupon_codeErr, setCoupon_codeErr] = useState('');
    const [start_dateErr, setStart_dateErr] = useState('');
    const [end_dateErr, setEnd_dateErr] = useState('');
    const [number_of_couponsErr, setNumber_of_couponsErr] = useState('');
    const [reductionErr, setReductionErr] = useState('');
    const [number_of_coupons_usedErr, setNumber_of_coupons_usedErr] = useState();
    const [deckNameUser, setDeckNameUser] = useState('');
    const [deckNameUser2, setDeckNameUser2] = useState('');
    
    const history = useHistory();    

  const handleChange = (event) => {
    
    let temp = event.target.value.split('-');
    if(event.target.value !== 'All Deck'){
      setDeckNameUser(temp[1]);
      setDeckNameUser2(null)
      setDeckName(temp[0]);
      setAll_Deck('');

    }else if(event.target.value == 'All Deck'){
      setAll_Deck(event.target.value);
      setDeckNameUser2(event.target.value);
      setDeckNameUser(null)
    }
    setDeckNameErr(false);
  };

//To disable past dates
useEffect(() => {
    const today = new Date();
    const nextDay = new Date();
    nextDay.setDate(today.getDate() + 1)
    const minEnd = nextDay.toISOString().slice(0, 10);
    const min = today.toISOString().slice(0, 10);
    const max = new Date(today.getFullYear() + 1, 11, 31)
      .toISOString()
      .slice(0, 10);
    setMinDate(min);
    setMinDateEnd(minEnd);
    setMaxDate(max);
  }, []);

const obj={filter: {},
    pagination: {page: 1, perPage: 100},
    sort: {field: 'id', order: 'ASC'}}

    // const url=`http://localhost:9001/decks`;

  const getData=async()=>{
    const data= await uploadDataProvider.getList('decks',obj)
    setDecksData(data);
    // console.log(data)
  }
  useEffect(()=>{
    getData()
  },[])

  // To show the get date form id in date field
  const createDbDate = (date) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${d.getFullYear()}-${month > 9? month: `0${month}`}-${day > 9 ? day: `0${day}`}`;
  }


  const getIdFunc = () => {
    const couponId =  localStorage.getItem('couponDataid');
    const obj = { id: couponId };
    globalRequestAxios('post', obj,'getCouponbyid','',token).then((res) => {     
            if(res?.data?.deck_name==="All Deck"){
                setAll_Deck(res?.data?.deck_name);
                setDeckNameUser2(res?.data?.deck_name);

            }
            else{
              setDeckNameUser(res?.data?.deck_name);
                setDeckName(res?.data?.deck_id);
            }
            setCoupon_code(res?.data?.code);
            setCoupon_name(res?.data?.codeName);
            start_date = createDbDate(res?.data?.start_date);
            setStart_date(start_date);
            end_date = createDbDate(res?.data?.expiry_date);
            setEnd_date(end_date);
            setNumber_of_coupons(res?.data?.number_of_coupons);
            setNumber_of_coupons_used(res?.data?.used_count)
            setReduction(res?.data?.reduction);
    });
  }

  useEffect(() => {
    getIdFunc();
  }, []);




  const handleSubmit = () => {
    const couponId =  localStorage.getItem('couponDataid');

    const formData = new FormData();
    if(all_Deck==="All Deck"){formData.append('code_type', 'alldeck');}  
    else {
        formData.append('code_type', 'singledeck');
        formData.append('deck_id', deckName);
    }
    formData.append('id', couponId);
    formData.append('deck_name',deckNameUser?deckNameUser:deckNameUser2)
    formData.append('codeName', coupon_name);
    formData.append('code', coupon_code);
    formData.append('start_date', start_date);
    formData.append('expiry_date', end_date);
    formData.append('number_of_coupons', number_of_coupons);
    formData.append('reduction', reduction);
    formData.append('status', 1);
    let error = false;
    if (!deckName && !all_Deck ) {

      setDeckNameErr("Please select the deck");
      error = true;
    }
    if (!coupon_name) {
      setCoupon_nameErr("Please enter coupon name");
      error = true;
    } 
     if (!coupon_code) {
      setCoupon_codeErr("Please enter coupon code.");
      error = true;
    }
    if (!start_date) {
      setStart_dateErr("Please select start date");
      error = true;
    }  
      if (!end_date) {
      setEnd_dateErr("Please select end date");
      error = true;
    } 
       if (!number_of_coupons) {
      setNumber_of_couponsErr("Please enter number of coupons");
      error = true;
    } 
    // if (!number_of_coupons_used) {
    //   setNumber_of_coupons_usedErr("Please enter number of coupons used");
    //   error = true;
    // }
       if (!reduction) {
      setReductionErr("Please enter reduction");
      error = true;
    }
    if (error) return;
    else{
        globalRequestAxios('post',formData,'editCoupon','',token)
        .then((res)=>{
            if(res?.status==0){
                setIsErr(true);
                setErrMsg(res?.message);
                setShowErrAlert(true);
                setTimeout(() => { 
                    setShowErrAlert(false);
                }, 2000);
                setErrAlert(res?.message);
            }else if(res?.status==1){
                setIsErr(false);
                setAlert(res?.message);
                setShowAlert(true);
                setTimeout(() => { 
                  setShowAlert(false);
              }, 1000);
              setTimeout(() => {
                history.push('/coupon');
              }, 2000);
              getData()
            }

        })
        .catch((err)=>{
            console.log(err);
        });
    }
  }
        return (
            <>
                {/* apply coupon for admin page */}
                <div className="coupon-code-box">
                    <h3 className='h3'>Edit Coupon Codes</h3>
                    <Grid container spacing={3}>
                    {showErrAlert &&<Alert variant="outlined" className='alert-right' severity="error">{errAlert}</Alert>}
                        {showAlert && <Alert severity="success" className='alert-right'>{alert}</Alert>}
                        <Grid container item xs={12} spacing={0}>
                        <FormControl variant="outlined" className='w-100'>
                            <InputLabel id="demo-simple-select-outlined-label">Deck name</InputLabel>
                            <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={all_Deck ? all_Deck : (deckName + "-" + deckNameUser)}
                            onChange={handleChange}
                            label="Deck name"
                            disabled={number_of_coupons_used > 0}
                          >
                            <MenuItem value={"All Deck"}>
                              <p>All Deck</p>
                            </MenuItem>
                            {decksData?.data?.map((item, index) => {
                              return (
                                <MenuItem key={index} value={item.id + "-" + item.name} className="custom-item">
                                  <p>{item.name}</p>
                                  <span>{item.short_description_en}</span>
                                </MenuItem>
                              );
                            })}
                          </Select>
                            {deckNameErr&& <span className='error'  style={{color:"red"}} >{deckNameErr}</span>}
                        </FormControl>
                        </Grid>
                        <Grid container item xs={6} spacing={0}>
                            <TextField className='w-100' id="outlined-basic" value={coupon_name} onChange={(e)=>{setCoupon_name(e.target.value.trimStart());setCoupon_nameErr(""); }} label="Coupon name" variant="outlined" />
                            {coupon_nameErr&& <span className='error' style={{color:"red"}} >{coupon_nameErr}</span>}
                        </Grid>
                        <Grid container item xs={6} spacing={0}>
                            <TextField className='w-100' id="outlined-basic" value={coupon_code} onChange={(e)=>{setCoupon_code(e.target.value.trimStart());setCoupon_codeErr("");}} label="Coupon Code" variant="outlined"  />
                            {coupon_codeErr&& <span className='error' style={{color:"red"}} >{coupon_codeErr}</span>}
                        </Grid>
                        <Grid container item xs={6} spacing={0}>
                            <TextField className='w-100' id="outlined-basic" value={number_of_coupons} type='number' label="Number of coupons" onChange={(e)=>{setNumber_of_coupons(e.target.value);setNumber_of_couponsErr("");
                              const number_of_coupons = e.target.value;
                              if (number_of_coupons < number_of_coupons_used ) {
                                setNumber_of_couponsErr("Please enter a number of coupons greater than number of coupons used ");
                              }else{
                                setNumber_of_coupons(number_of_coupons)
                                setNumber_of_couponsErr("");
                              }
                          }}  variant="outlined"  />
                            {number_of_couponsErr&& <span className='error' style={{color:"red"}} >{number_of_couponsErr}</span>}
                        </Grid>
                        <Grid container item xs={6} spacing={0}>
                        <TextField 
                              className='w-100' 
                              id="outlined-basic" 
                              type='number' 
                              label="Number of coupons used" 
                              value={number_of_coupons_used} 
                              onChange={(e)=>{
                                setNumber_of_coupons_used(e.target.value);
                                setNumber_of_coupons_usedErr("")
                              }} 
                              variant="outlined" 
                              disabled={true}
                              readOnly={true}
                            />
                            {/* {number_of_coupons_usedErr && 
                              <span className='error' style={{color:"red"}} >
                                {number_of_coupons_usedErr}
                              </span>
                            } */}
                        </Grid>
                        <Grid container item xs={6} spacing={0}>
                            <TextField className='w-100' id="outlined-basic" type='number' value={reduction} label="Reduction %" onChange={(e)=>{setReduction(e.target.value);setReductionErr("");
                             const reduction = e.target.value;
                             if (reduction < 0.1 || reduction > 100) {
                               setReductionErr("Please enter a reduction % between 1 and 100.");
                             } else {
                               setReduction(reduction);
                               setReductionErr("");
                             }
                          }} variant="outlined"  />
                            {reductionErr&& <span className='error' style={{color:"red"}} >{reductionErr}</span>}
                        </Grid>
                        <Grid container item xs={6} spacing={0}>
                            <TextField
                                id="date"
                                label="Start Date"
                                type="date"
                                // defaultValue={minDate}
                                value={start_date}
                                onChange={(e)=>{setStart_date(e.target.value);setStart_dateErr("");}}
                                variant="outlined"
                                className='w-100'
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: minDate,
                                    max: maxDate,
                                    style: { cursor: "pointer" },
                                  }}
                            />
                        {start_dateErr&& <span className='error' style={{color:"red"}} >{start_dateErr}</span>}
                        </Grid>
                        <Grid container item xs={6} spacing={0}>
                            <TextField
                                id="date"
                                label="End Date"
                                type="date"
                                // defaultValue={maxDate}
                                value={end_date}
                                onChange={(e)=>{setEnd_date(e.target.value);setEnd_dateErr("");}}
                                variant="outlined"
                                className='w-100'
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: minDateEnd,
                                    max: maxDate,
                                    style: { cursor: "pointer" },
                                  }}
                            />
                   {end_dateErr&& <span className='error' style={{color:"red"}} >{end_dateErr}</span>}
 
                        </Grid>
                        
                        {/* <Grid container item xs={6} spacing={0}>
                            <TextField className='w-100' id="outlined-basic" label="Number of coupons used" variant="outlined" />
                        </Grid> */}
                        <Grid container item xs={12} spacing={0}>
                        {/* <Link to={`/coupon`}> */}
                            <Button variant="contained" size="large" color="primary"  style={{marginRight: '16px'}} onClick={()=>handleSubmit()}>Update</Button>
                        {/* </Link> */}
                        {/* <Button variant="outlined" size="large" color="error">Cancel</Button> */}
                        </Grid>
                    </Grid>
                </div> 
                </>
        );

}

export default CouponEdit;
            