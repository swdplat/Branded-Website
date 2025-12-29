  // 8 大體系（後兩個保留）
window.PAYMENT_CATEGORIES = [
  { id: "credit_card",    name_zh: "信用卡",         name_en: "Credit Card",        icon: "./assest/payments/icons/credit_card.svg" },
  { id: "ewallet",        name_zh: "電子/行動支付",  name_en: "E-Wallet / Mobile",  icon: "./assest/payments/icons/ewallet.svg" },
  { id: "bank_transfer",  name_zh: "銀行轉帳",       name_en: "Bank Transfer",      icon: "./assest/payments/icons/bank_transfer.svg" },
  { id: "carrier_billing",name_zh: "電信帳單繳費",   name_en: "Carrier Billing",    icon: "./assest/payments/icons/mobile_phone.svg" },
  { id: "cash_store",     name_zh: "實體商店繳費",   name_en: "Pay in Store",       icon: "./assest/payments/icons/over_the_counter.svg" },
  { id: "bnpl",           name_zh: "先買後付",       name_en: "BNPL",               icon: "./assest/payments/icons/BNPL03.svg" },
  { id: "reserved_1",     name_zh: "（保留）",       name_en: "Reserved 1",         icon: "./assest/payments/icons/reserved.svg" },
  { id: "reserved_2",     name_zh: "（保留）",       name_en: "Reserved 2",         icon: "./assest/payments/icons/reserved.svg" }
];

  // 各體系底下可用的「支付廠商/方式」清單（ID 引用呼叫）
window.PAYMENT_METHODS = {
  credit_card: [   //路徑credit_card/內
    { id: "visa",         name_zh: "Visa",       name_en: "",            icon: "./assest/payments/vendor/credit_card/visa_logo.svg" },
    { id: "mastercard",   name_zh: "萬事達",     name_en: "Mastercard",   icon: "./assest/payments/vendor/credit_card/mastercard_logo.svg" },
    { id: "jcb",          name_zh: "JCB",        name_en: "",            icon: "./assest/payments/vendor/credit_card/jcb_logo.svg" },
    { id: "unionpay",     name_zh: "銀聯",       name_en: "UnionPay",     icon: "./assest/payments/vendor/credit_card/unionpay_logo.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/credit_card/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/credit_card/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/credit_card/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/credit_card/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/credit_card/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/credit_card/路徑.svg" }
  ],
  ewallet: [   //路徑ewallet/內
      //台灣
    { id: "linepay",     name_zh: "LINE Pay",   name_en: "",   icon: "./assest/payments/vendor/ewallet/linepay.svg" },
    { id: "jkopay",      name_zh: "街口支付",    name_en: "JKOPay",     icon: "./assest/payments/vendor/ewallet/jkopay_TW.svg" },
    { id: "twpay",      name_zh: "台灣Pay",    name_en: "TaiwanPay",     icon: "./assest/payments/vendor/ewallet/jkopay.svg" },
      //大陸
    { id: "alipay",      name_zh: "支付寶",    name_en: "AliPay",     icon: "./assest/payments/vendor/ewallet/alipay.svg" },
    { id: "WeChatPay",      name_zh: "微信支付",    name_en: "WeChat Pay",     icon: "./assest/payments/vendor/ewallet/WeChatPay.svg" },
      //香港
    { id: "alipayhk",      name_zh: "支付寶",    name_en: "AliPay",     icon: "./assest/payments/vendor/ewallet/alipayhk.svg" },
    { id: "PayMe",      name_zh: "PayMe",    name_en: "",     icon: "./assest/payments/vendor/ewallet/PayMe.svg" },
    { id: "Octopus",      name_zh: "八達通",    name_en: "Octopus Online Payment",     icon: "./assest/payments/vendor/ewallet/Octopus.svg" },
      //印尼
    { id: "ovo",      name_zh: "OVo",    name_en: "",     icon: "./assest/payments/vendor/ewallet/ovo.svg" },
    { id: "Gopay",      name_zh: "GO Pay",    name_en: "",     icon: "./assest/payments/vendor/ewallet/Logo_Gopay.svg" },
    { id: "dana",      name_zh: "DANA",    name_en: "",     icon: "./assest/payments/vendor/ewallet/dana.svg" },
    { id: "linkaja",      name_zh: "LinkAja",    name_en: "",     icon: "./assest/payments/vendor/ewallet/link-aja-seeklogo.svg" },
    { id: "Dokuid",       name_zh: "Doku Wallet",    name_en: "",     icon: "./assest/payments/vendor/ewallet/Dokuid.svg" },
      //大馬
    { id: "grab-pay",      name_zh: "GrabPay",    name_en: "",     icon: "./assest/payments/vendor/ewallet/grab-pay.svg" },
    { id: "shopee-pay",      name_zh: "ShopeePay",    name_en: "",     icon: "./assest/payments/vendor/ewallet/shopee-pay.svg" },
    { id: "TouchGo_eWallet",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/Touch_'n_Go_eWallet_logo.svg" },
    { id: "boost-MY",      name_zh: "Boost",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/boost-MY.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/ewallet/路徑.svg" }
  ],
  bank_transfer: [  //路徑bank_transfer/內
      //台灣銀行
    { id: "HNCB_WebATM",       name_zh: "華南銀行",      name_en: "HNCB WebATM",       icon: "./assest/payments/vendor/bank_transfer/HNCB_WebATM.svg" },
    { id: "CTBC_WebATM",       name_zh: "中國信託",      name_en: "CTBC WebATM",       icon: "./assest/payments/vendor/bank_transfer/CTBC_WebATM.svg" },
    { id: "E.SUN_WebATM",      name_zh: "玉山銀行",      name_en: "E.SUN WebATM",      icon: "./assest/payments/vendor/bank_transfer/E.SUN_WebATM.svg" },
    { id: "Taishin_WebATM",    name_zh: "台新銀行",      name_en: "Taishin WebATM",    icon: "./assest/payments/vendor/bank_transfer/Taishin_WebATM.svg" },
    { id: "TFB_WebATM",        name_zh: "台北富邦",      name_en: "TFB WebATM",        icon: "./assest/payments/vendor/bank_transfer/TFB_WebATM.svg" },
    { id: "Land_Bank_WebATM",  name_zh: "土地銀行",      name_en: "Land Bank WebATM",  icon: "./assest/payments/vendor/bank_transfer/Land_Bank_WebATM.svg" },
    { id: "SCSB_WebATM",       name_zh: "上海銀行",      name_en: "SCSB WebATM",       icon: "./assest/payments/vendor/bank_transfer/SCSB_WebATM.svg" },
    { id: "BoT_WebATM",        name_zh: "台灣銀行",      name_en: "BoT WebATM",        icon: "./assest/payments/vendor/bank_transfer/BoT_WebATM.svg" },
    { id: "Mega_ICBC_WebATM",  name_zh: "兆豐銀行",      name_en: "Mega ICBC WebATM",  icon: "./assest/payments/vendor/bank_transfer/Mega_ICBC_WebATM.svg" },
    { id: "First_WebATM",      name_zh: "第一銀行",      name_en: "First WebATM",      icon: "./assest/payments/vendor/bank_transfer/First_WebATM.svg" },
    { id: "CHB_WebATM",        name_zh: "彰化銀行",      name_en: "CHB WebATM",        icon: "./assest/payments/vendor/bank_transfer/CHB_WebATM.svg" },
    { id: "POSTAL_WebATM",     name_zh: "中華郵政",      name_en: "POSTAL WebATM",     icon: "./assest/payments/vendor/bank_transfer/POSTAL_WebATM.svg" },
    { id: "TCB_WebATM",        name_zh: "合作金庫",      name_en: "TCB WebATM",        icon: "./assest/payments/vendor/bank_transfer/TCB_WebATM.svg" },
      //大陸銀行
    { id: "ICBC_chinaATM",     name_zh: "中國工商銀行",   name_en: "ICCB WebATM",       icon: "./assest/payments/vendor/bank_transfer/ICBC_chinaATM.svg" },
    { id: "ABC_chinaATM",      name_zh: "中國農業銀行",   name_en: "ABC WebATM",        icon: "./assest/payments/vendor/bank_transfer/ABC_chinaATM.svg" },
    { id: "CCB_chinaATM",      name_zh: "中國建設銀行",   name_en: "CCB WebATM",        icon: "./assest/payments/vendor/bank_transfer/CCB_chinaATM.svg" },
    { id: "BOC_chinaATM",      name_zh: "中國銀行",       name_en: "BOC WebATM",        icon: "./assest/payments/vendor/bank_transfer/BOC_chinaATM.svg" },
      //香港銀行
    { id: "HSB_HKWebATM",      name_zh: "恒生銀行",      name_en: "HSB WebATM",     icon: "./assest/payments/vendor/bank_transfer/HSB_HKWebATM.svg" },
    { id: "FPS__WebATM",      name_zh: "轉速快",    name_en: "FPS",     icon: "./assest/payments/vendor/bank_transfer/FPS__WebATM.svg" },
    { id: "HSBC_WebATM",      name_zh: "上海滙豐銀行",    name_en: "HSBC WebATM",     icon: "./assest/payments/vendor/bank_transfer/HSBC_WebATM.svg" },
      //印尼
    { id: "Bank-Central-Asia",      name_zh: "Bank Central Asia",    name_en: "",     icon: "./assest/payments/vendor/bank_transfer/Bank-Central-Asia.svg" },
    { id: "Bank-Negara-Indonesia",      name_zh: "Bank Negara Indonesia",    name_en: "",     icon: "./assest/payments/vendor/bank_transfer/Bank-Negara-Indonesia.svg" },
    { id: "Permata-Bank",      name_zh: "Permata Bank",    name_en: "",     icon: "./assest/payments/vendor/bank_transfer/Permata-Bank.svg" },
    { id: "cimb-clicks",      name_zh: "CIMB Clicks",    name_en: "",     icon: "./assest/payments/vendor/bank_transfer/cimb-clicks.svg" },
    { id: "bank-mandiri-seeklogo",      name_zh: "Mandiri",    name_en: "",     icon: "./assest/payments/vendor/bank_transfer/bank-mandiri-seeklogo.svg" },
    { id: "Bank-Rakyat-Indonesia",      name_zh: "Bank-Rakyat-Indonesia",    name_en: "",     icon: "./assest/payments/vendor/bank_transfer/Bank-Rakyat-Indonesia.svg" },
    { id: "quick-response-code-indonesia",      name_zh: "QRIS",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bank_transfer/quick-response-code-indonesia.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bank_transfer/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bank_transfer/路徑.svg" }
  ],
  carrier_billing: [   //路徑carrier_billing/內
    { id: "CW_MB",      name_zh: "中華電信",    name_en: "Chunghwa Telecom",     icon: "./assest/payments/vendor/carrier_billing/CW_MB.svg" },
    { id: "FET_MB",      name_zh: "遠傳電信",    name_en: "FarEasTone",     icon: "./assest/payments/vendor/carrier_billing/FET_MB.svg" },
    { id: "TW_MB",      name_zh: "台灣大哥大",    name_en: "TaiwanMobile",     icon: "./assest/payments/vendor/carrier_billing/TW_MB.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/carrier_billing/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/carrier_billing/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/carrier_billing/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/carrier_billing/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/carrier_billing/路徑.svg" }
  ],
  cash_store: [    //路徑cash_store/內
      //台灣
    { id: "7-eleven_TW",      name_zh: "7-11 統一超商",    name_en: "7-Eleven",     icon: "./assest/payments/vendor/cash_store/7-eleven_TW.svg" },
    { id: "familymart-TW",      name_zh: "全家便利商店",    name_en: "FamilyMart",     icon: "./assest/payments/vendor/cash_store/familymart-TW.svg" },
    { id: "Hi-Life-TW",      name_zh: "萊爾富便利商店",    name_en: "HiLIFE",     icon: "./assest/payments/vendor/cash_store/Hi-Life-TW.svg" },
    { id: "OK_TW",      name_zh: "OK 超商",    name_en: "OKMart",     icon: "./assest/payments/vendor/cash_store/OK_TW.svg" },
      //印尼
    { id: "Alfamart_logo",      name_zh: "Alfa Group",    name_en: "",     icon: "./assest/payments/vendor/cash_store/Alfamart_logo.svg" },
    { id: "Indomaret",      name_zh: "Indomaret",    name_en: "",     icon: "./assest/payments/vendor/cash_store/Indomaret.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/cash_store/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/cash_store/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/cash_store/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/cash_store/路徑.svg" }
  ],
  bnpl: [    //路徑bnpl/內
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bnpl/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bnpl/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bnpl/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bnpl/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bnpl/路徑.svg" },
    { id: "填呼喚ID",      name_zh: "填名字",    name_en: "英文名稱",     icon: "./assest/payments/vendor/bnpl/路徑.svg" }
  ],
  reserved_1: [],
  reserved_2: []
};

// 掛載小工具：依路徑嘗試多副檔名（.svg → .png → .webp → .jpg）
window.resolveIcon = function(imgEl, baseOrFull){
  const isFull = /\/.+\.(svg|png|webp|jpg)$/i.test(baseOrFull);
  const bases  = isFull ? [baseOrFull.replace(/\.(svg|png|webp|jpg)$/i,'')] : [baseOrFull];
  const exts   = ['.svg', '.png', '.webp', '.jpg'];
  const tries  = [];
  bases.forEach(b => exts.forEach(ext => tries.push(b + ext)));
  let   i             = 0;
  const next          = ()=>{ if (i >= tries.length){ imgEl.removeAttribute('src'); imgEl.alt = 'No icon'; return; } imgEl.src = tries[i++]; };
        imgEl.onerror = next; next();
};
