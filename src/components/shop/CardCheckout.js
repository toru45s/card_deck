import React, { useEffect, useState } from 'react';
import Button from "@material-ui/core/Button";
import '../css/CardCheckout.css';
import closeIcon from './../img/cancel.png';
import backArrow from './../img/back-arrow.png';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwt_decode from "jwt-decode";
import jwt from 'jsonwebtoken';
import { withTranslation } from 'react-multi-lang';
import globalRequestAxios from '../../GlobalModules/globalRequestAxios';
import Loader from './Loader';

const CardCheckout = (props) => {
    
    const t = props.t;
    const [reRender,setreRender] = useState(false)
    let data = JSON.parse(localStorage.getItem('productData'));      
    let All_deck = JSON.parse(localStorage.getItem("data_AllBuy"));
    const history = useHistory();
    const [flag,setFlag] = useState(false)    
    const [discount,setDiscount] = useState(0);
    const [isErr,setIsErr]=useState(false);
    const[errMsg,setErrMsg]=useState('');
    let [applied, setApplied] = useState(false);
    const [priceData , setPriceData]= useState([]);
    const [couponData , setCouponData]= useState("");
    let [input , setInput]= useState("");
    const [newInput,setNewInput]=useState("");    
    const token = Cookies.get('token');
    const decoded = jwt_decode(token); 
    // let [noteData,setNoteData]= useState("");
    const [isLoader,setIsLoader] = useState(false);
    const [couponId,setCouponId] = useState("");

    const routerHome = () => {
        // history.push('/');
        props.closeCheckout();
    }

    const reRenderFun = () => {
        localStorage.setItem("isopen_poup","true")
        data=JSON.parse(localStorage.getItem("productData"));
        All_deck = JSON.parse(localStorage.getItem("data_AllBuy"));
           
            if(All_deck){ 
                setFlag(false);  
                setCouponData("alldeck")
                
            }
            else if(data ){ 
                setFlag(true)  //check localstorage data is available or not single card
                setCouponData("singledeck")
                
            }else if(!data && !All_deck) {
                window.location.replace("/");
            }
           
    }

            useEffect(()=>{
                reRenderFun();
            },[reRender])

        let surePopupFuc=()=>{
            const Sure_poup = localStorage.getItem("Sure_poup")
            if(Sure_poup  && All_deck){
                openApplyWindow()
            }          
            if(data?.selected_plan=="YEAR"){
                setPriceData(data?.price_year);
            }
            else if(data?.selected_plan=="MONTH"){
                setPriceData(data?.price);  
            }
            else{
                setPriceData(All_deck?.amount);
            }
            localStorage.removeItem("Sure_poup")
        }

            useEffect(()=>{
                surePopupFuc()
            },[])        

            const handleApplyCoupon = () => {
                
                const formData = new FormData();
                formData.append('code', input);
                formData.append('code_type', couponData);
                formData.append('user_id', decoded?.id);
                if(!All_deck)
                formData.append('deck_id', data?.id);
                if(data?.selected_plan=="YEAR"){
                    formData.append('plan_type', "yearly");
                }
                else if(data?.selected_plan=="MONTH"){
                    formData.append('plan_type', "monthly");
                }
                else{
                    formData.append('plan_type', "yearly");
                }
                globalRequestAxios('post',formData,'useCoupon','',token)
                .then((res)=>{
                    if (res) {
                        // add logic here to remove coupon
                        applied = true;
                        // setApplied(applied);
                        if(res?.status===0){
                            setIsErr(true);
                            setErrMsg(res?.message);
                        }else if(res?.status===1){
                           setDiscount(res?.percentage);
                           setCouponId(res?.coupon_id);
                           setApplied(true)
                           setIsErr(false);
                           setNewInput(input);
                        }
                      } else {
                        // add logic here to apply coupon
                        // applied = false;
                        // setApplied(applied)
                        setInput('')
                    }
                    setPriceData(res?.finalprice?res?.finalprice:All_deck?.amount?All_deck?.amount:data?.selected_plan=="YEAR"? data?.price_year:data?.price)
                }).catch((err)=>{
                    console.log("err",err)
                })
            // }
         }

         const getPaypalToken=async ()=> {
            // GET PAYPAL BEARER TOKEN
            const tokenData = new URLSearchParams();
            tokenData.append('grant_type', 'client_credentials');
            const token = await fetch("https://api.paypal.com/v1/oauth2/token", {
                method: 'post',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + btoa(process.env.REACT_APP_PAYPAL_CLIENT_ID + ":" + process.env.REACT_APP_PAYPAL_SECRET)
                },
                body: tokenData
            });
            if (!token.ok) {
                throw Error(token.statusText);
            }
            const tokenJSON = await token.json();
    
            return tokenJSON.access_token;
        }

        const  getGeoInfo= async() =>{
            try {
                const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=79bf5db729e548feb582624d4e134756');
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                const responseJSON = await response.json();
                if (responseJSON.country_name) {
                    return responseJSON.country_name;
                } else {
                    return false;
                }
            } catch (err) {
                console.log(err);
                return false;
            }
        }

        
        const handleCheckout= async(interval,price,deck_name)=>{
            if(!applied){
            setInput('')
            setIsErr(false);
            }
            setIsLoader(true);
            const access_token = await getPaypalToken();
            const country = await getGeoInfo();
            // CREATE PAYPAL PRODUCT
            const productData = {
                name: deck_name,
                description: "Digital Card Deck",
                type: "DIGITAL",
                category: "GAMES",
            };           
            const product = await fetch("https://api.paypal.com/v1/catalogs/products", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token
                },
                body: JSON.stringify(productData)
            });
            if (!product.ok) {
                throw Error(product.statusText);
            }
            const productJSON = await product.json();
            // CREATE PAYPAL PLAN

            const planData = {
                product_id: productJSON.id,
                name: productJSON.name,
                description: "Digital Card Deck subscription",
                status: "ACTIVE",
                billing_cycles: [
                    {
                        frequency: {
                            interval_unit: interval,
                            interval_count: 1
                        },
                        tenure_type: "REGULAR",
                        pricing_scheme: {
                            fixed_price: {
                                value: price,
                                currency_code: "USD"
                            }
                        },
                        sequence: 1,
                        total_cycles: 0
                    }
                ],
                payment_preferences: {
                    setup_fee: {
                        currency_code: "USD",
                        value: "0.00"
                    },
                    setup_fee_failure_action: "CONTINUE",
                    payment_failure_threshold: 3
                }
            };
            if (country === 'Israel') {
                planData.taxes = {
                    inclusive: false,
                    percentage: "17.00"
                };
            }
            const plan = await fetch("https://api.paypal.com/v1/billing/plans", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token
                },
                body: JSON.stringify(planData)
            });
            if (!plan.ok) {
                throw Error(plan.statusText);
            }
            const planJSON = await plan.json();

            // CREATE PAYPAL SUBSCRIPTION
            const subscriptionData = {
                plan_id: planJSON.id
            };
            const subscription = await fetch("https://api.paypal.com/v1/billing/subscriptions", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token
                },
                body: JSON.stringify(subscriptionData)
            });
            if (!subscription.ok) {
                throw Error(subscription.statusText);
            }
            const subscriptionJSON = await subscription.json();

            // INITIATE A TRANSACTION ON OUR SIDE
            const transactionData = {
                product_id: data?.id,
                plan_id: planJSON.id,
                subscription_id: subscriptionJSON.id,
                interval: interval,
                price: price,
                coupon_id: couponId,

              };

            const transaction = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/startTransaction", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token
                },
                body: JSON.stringify(transactionData)
            });
            if (!transaction.ok) {
                throw Error(transaction.statusText);
            }
            const paypalWindow = window.open(subscriptionJSON.links[0].href, "_blank");
            props.closeCheckout();
            setIsLoader(false)
            // let i = 1;
            // const isPaypalClosedInterval = setInterval(async () => {
            //     if(paypalWindow?.closed) {
            //         clearInterval(isPaypalClosedInterval);
            //         if (i === 1) {
            //             this.props.sendAnalyticsEvent('Closed immediately');
            //             if (typeof window.tidioChatApi !== "undefined") {
            //                 window.tidioChatApi.open();
            //                 window.tidioChatApi.messageFromOperator("I saw that you were looking at the purchase options, may I help?");
            //             }
            //             return false;
            //         } else if (i >= 100) return false;
            //         const response = await fetch(process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT + "/getLatestUserTransaction", {
            //             headers: {
            //                 "x-access-token": token
            //             }
            //         });
            //         // if (response.ok) {
            //         //     const json = await response.json();
            //         //     if (json.status === 0) {
            //         //         this.props.sendAnalyticsEvent('Cancelled subscription transaction');
            //         //         if (typeof window.tidioChatApi !== "undefined") {
            //         //             window.tidioChatApi.open();
            //         //             window.tidioChatApi.messageFromOperator("I saw that you were looking at the purchase options, may I help?");
            //         //         }
            //         //     }
            //         // }
            //     }
            //     i++;
            // }, 3000);
        }


        const openApplyWindow = () => {
            document.getElementById("shopAppliedCoupon").style.display="flex"
        }
        const closeWindow = () => {
            document.getElementById("shopAppliedCoupon").style.display="none"
        }

        const handleNo = () => {
            if(data){
                localStorage.removeItem("productData");
                setFlag(true)
                reRenderFun();
            }
            closeWindow()
            surePopupFuc()
        }

        const handleYes = () => {
            if(data){
                localStorage.removeItem("data_AllBuy");
                setFlag(true)
                reRenderFun();
            }
            closeWindow()
        }

        // let getNoteData = JSON.parse(localStorage.getItem("note"))
        // useEffect(() => {
        //    let getNoteData = JSON.parse(localStorage.getItem("note"))
        //     if(getNoteData){
        //         setNoteData(getNoteData.note)
        //     }else if(!getNoteData){
        //         setNoteData("")
                
        //     }
        // }, [noteData])
    
        return (
            <>
                {isLoader && <Loader/>}
            <div className="card-container">
            <h3 className="heading-h3">
            {t('cartCheckout.CartPage')}
            </h3>
            <h6 className="heading-h5">{t('auth.login_text')}</h6>
            <div className="card-parent">

                <div className="card-left">
                {flag && !reRender ? (
                    <>
                <div className="card-box-parent">
                    <div className="card-row-head">
                    <h6>{t('cartCheckout.Product')}</h6>
                    <h6>{t('cartCheckout.Subtotal')}</h6>
                    </div>
                    <div className="card-box-body">
                    <div className="td-type">
                        <img src={closeIcon} alt="close icon"  className="close-icon"  onClick={() => { localStorage.removeItem("productData"); props.closeCheckout() }} />
                        <img src={data?.image} alt="product" className="product-img" />
                        <h6>{data?.selected_plan === "YEAR" ? `${data?.name}/Yearly Subscription` : `${data?.name}/Monthly Subscription`}</h6>
                    </div>
                    <div className="td-type">${data?.selected_plan == "YEAR" ? data?.price_year : data?.price}</div>
                    </div>
                </div>
                <div className='node-box'>
                    <p className='p4'><b>Note :</b> {t('cartCheckout.ThankyouNote')}</p>
                </div>
                </>
                ) : (
                    <>
                <div className="card-box-parent">
                    <div className="card-row-head">
                    <h6>{t('cartCheckout.Product')}</h6>
                    <h6>{t('cartCheckout.Subtotal')}</h6>
                    </div>
                    <div className="card-box-body">
                    <div className="td-type">
                        <img src={closeIcon} alt="close icon" className="close-icon"  onClick={() => { localStorage.removeItem("data_AllBuy"); props.closeCheckout();}} />
                        <h6>{All_deck?.accountData}</h6>
                    </div>
                    <div className="td-type">${All_deck?.amount}</div>
                    </div>
                </div>
                <div className='node-box'>
                    <p className='p4'><b>Note :</b> {t('cartCheckout.ThankyouNote')}</p>
                </div>
                </>
                )}
                    
                    <h3 className="heading-h5-continue" onClick={()=>routerHome()}>
                        <img src={backArrow} alt="back arrow" className="back-arrow"   />{t('cartCheckout.ContinueShopping')}
                        
                    </h3>
                </div>
                <div className="card-right">
                    <div className="card-right-box">
                        <h6 className="heading-h5">
                            {/* {t('cartCheckout.DiscountCode')} */}
                            {t('cartCheckout.PromotionCode')}
                        </h6>
                        <div className="apply-code-row">
                            <input type="text" onChange={(e)=>{
                                setInput(e.target.value.trimStart())
                                }}
                                value={input}
                                 placeholder={t('cartCheckout.Entercode')} />
                           {!applied?<button className="btn-apply-code"  onClick={()=>{handleApplyCoupon()}}>
                            { 'Apply'}
                            </button>:
                            <button  className="btn-apply-code remove"
                            onClick={()=>{
                                setIsErr(false);
                                setApplied(false);
                                setInput('');
                                setDiscount(0)
                                // productData
                                setPriceData(All_deck?.amount ? All_deck?.amount:data?.selected_plan=="YEAR" ? data?.price_year:data?.price)
                            }}>Remove</button>} 
                           {isErr&& <span className='error' >{errMsg}</span>}
                        </div>
                    </div>
                    <div className="card-right-box">
                        <h6 className="heading-h5 mb-20">{t('cartCheckout.CardTotal')}</h6>
                        <div className="card-box-parent border-top">
                            <div className="card-box-body">
                                <div className="td-type">{t('cartCheckout.Subtotal')}</div>
                                <div className="td-type">${ !All_deck ? (data?.selected_plan=="YEAR"? data?.price_year:data?.price):(All_deck?.amount)}</div>
                            </div>
                            <div className="card-box-body align-top">
                                <div className="td-type column">
                                    <div>{t('cartCheckout.Discount')}</div>
                                    {applied?<span className="apply-text">{newInput} <span className='clear-icon' onClick={()=>{setApplied(false);setInput('');setIsErr(false);setDiscount(0);setPriceData(All_deck?.amount?All_deck?.amount:data?.selected_plan=="YEAR"? data?.price_year:data?.price)}}>&times;</span></span>:null}
                                </div>
                                <div className="td-type column ">{discount}%</div>
                            </div>
                            <div className="card-box-body">
                                <div className="td-type">{t('cartCheckout.Total')}</div>
                                <div className="td-type">${priceData}</div>
                            </div>
                        </div>
                        <button className="btn-full" onClick={()=>handleCheckout( All_deck?"YEAR": data?.selected_plan , priceData,data?.name?data?.name:"alldeck" )} >{t('cartCheckout.Proceedtocheckout')}</button>                        
                    </div>
                    
                </div>
            </div>
            

        
                <div className="modal-wrapper" id="shopAppliedCoupon">                
                    <div id="shop_window_new" >
                        <div className='close-icon' onClick={()=>handleNo()}>&times;</div>
                        <h3 className='mb-3'>{t('Are you sure ?')}</h3>
                        <p>{t('Want to replace cart deck.')}</p>
                        
                        <div className="bottom-end">
                        <Button variant="contained" onClick={()=>handleNo()} >{t('No')}</Button>
                        <Button variant="contained" onClick={()=>handleYes()} color="primary">
                            {t('Yes')}
                        </Button>                       
                        </div>
                    </div>
                    
                </div>
            </div>
        </>
        )
    }

export default withTranslation(CardCheckout);
