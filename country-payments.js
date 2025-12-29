// 以 ISO 3166-1 alpha-2 為 key 呼叫
window.COUNTRY_PAYMENTS = {
  "TW": { // 台灣
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "unionpay"],
      ewallet        : ["linepay", "jkopay"],
      bank_transfer  : ["HNCB_WebATM", "CTBC_WebATM", "E.SUN_WebATM", "Taishin_WebATM", "TFB_WebATM", "Land_Bank_WebATM", "SCSB_WebATM", "BoT_WebATM", "Mega_ICBC_WebATM", "First_WebATM", "CHB_WebATM", "POSTAL_WebATM", "TCB_WebATM"],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    }
  },
  "JP": { // 日本
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "unionpay"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    }
  },
  "US": {
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "unionpay"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    }
  },
  "GB": { 
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa","mastercard","jcb"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    } 
  },
  "CN": { 
    "map-flag-Places": true,
    methods: {
      credit_card    : ["unionpay"],
      ewallet        : [],
      bank_transfer  : ["ICBC_chinaATM", "ABC_chinaATM", "CCB_chinaATM", "BOC_chinaATM"],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    } 
  },
  "HK": { 
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa","mastercard","unionpay"],
      ewallet        : ["alipayhk","PayMe","Octopus"],
      bank_transfer  : ["HSB_HKWebATM","FPS__WebATM","BOC_chinaATM","HSBC_WebATM"],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    } 
  },
  "KR": { 
    "map-flag-Places": false,
    methods: {
      credit_card    : ["visa","mastercard","jcb"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    } 
  },
  "MO": { 
    "map-flag-Places": false,
    methods: {
      credit_card    : ["visa","mastercard","jcb"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    } 
  },
  "SG": { 
    "map-flag-Places": false,
    methods: {
      credit_card    : ["visa","mastercard","jcb"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    } 
  },
  "MY": { 
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa","mastercard","jcb"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : []
    } 
  },

};

// 取用介面
window.getCountryPayments = function(iso2){
  const code = String(iso2||'').toUpperCase();
  return (window.COUNTRY_PAYMENTS && window.COUNTRY_PAYMENTS[code]) || { methods: {} };
};
