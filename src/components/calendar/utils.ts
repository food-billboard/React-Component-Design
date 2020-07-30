const getDateName = (date: Date | number) => {
  let holiday = getHoliday_1(date);
  let active = true;
  if (!holiday) {
    const lunarDate: { [key: string]: number | undefined } = getLunarDate(date);
    holiday = getHoliday_2(lunarDate);
    if (!holiday) {
      active = false;
      const { day } = lunarDate;
      holiday = day ? getChineseDay(day) : '';
    }
  }
  return {
    holiday,
    active
  };
};

const getHoliday_1 = (date: Date | number | string) => {
  let _date:Date;
  if (Object.prototype.toString.call(date) === "[object Date]") {
    _date = new Date(date);
  } else if (typeof date === "number") {
    _date = new Date(date);
  } else if (typeof date === 'string' && !Number.isNaN(parseInt(date, 10))) {
    _date = new Date(parseInt(date, 10));
  } else {
    return false;
  }
  const holidaylist:any = {
    "1-1": "元旦",
    "2-14": "情人节",
    "3-8": "妇女节",
    "5-1": "劳动节",
    "5-4": "青年节",
    "6-1": "儿童节",
    "7-1": "建党节",
    "8-1": "建军节",
    "9-1": "教师节",
    "10-1": "国庆节",
    "12-25": "圣诞节"
  };
  return holidaylist[`${_date.getMonth() + 1}-${_date.getDate()}`];
};

const getHoliday_2 = (lunarDate: { [key: string]: number | undefined }) => {
  var holidaylist: { [key: string]: string } = {
    "1-1": "春节",
    "1-15": "元宵节",
    "5-5": "端午节",
    "7-7": "七夕节",
    "7-15": "中元节",
    "8-15": "中秋节",
    "9-9": "重阳节",
    "12-8": "腊八节",
    "12-24": "小年",
    "1-0": "除夕"
  };
  const { month, day } = lunarDate;
  return holidaylist[month + "-" + day];
};

function getChineseDay(d: number) {
  var nStr1 = [
    "日",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十"
  ];
  var nStr2 = ["初", "十", "廿", "卅", "　"];
  switch (d) {
    case 10:
      return "初十";
    case 20:
      return "二十";
    case 30:
      return "三十";
    default:
      return nStr2[Math.floor(d / 10)] + nStr1[d % 10];
  }
}

var lunar = {
  monthadd: [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
  calendar: [
    0xa4b,
    0x5164b,
    0x6a5,
    0x6d4,
    0x415b5,
    0x2b6,
    0x957,
    0x2092f,
    0x497,
    0x60c96,
    0xd4a,
    0xea5,
    0x50da9,
    0x5ad,
    0x2b6,
    0x3126e,
    0x92e,
    0x7192d,
    0xc95,
    0xd4a,
    0x61b4a,
    0xb55,
    0x56a,
    0x4155b,
    0x25d,
    0x92d,
    0x2192b,
    0xa95,
    0x71695,
    0x6ca,
    0xb55,
    0x50ab5,
    0x4da,
    0xa5b,
    0x30a57,
    0x52b,
    0x8152a,
    0xe95,
    0x6aa,
    0x615aa,
    0xab5,
    0x4b6,
    0x414ae,
    0xa57,
    0x526,
    0x31d26,
    0xd95,
    0x70b55,
    0x56a,
    0x96d,
    0x5095d,
    0x4ad,
    0xa4d,
    0x41a4d,
    0xd25,
    0x81aa5,
    0xb54,
    0xb6a,
    0x612da,
    0x95b,
    0x49b,
    0x41497,
    0xa4b,
    0xa164b,
    0x6a5,
    0x6d4,
    0x615b4,
    0xab6,
    0x957,
    0x5092f,
    0x497,
    0x64b,
    0x30d4a,
    0xea5,
    0x80d65,
    0x5ac,
    0xab6,
    0x5126d,
    0x92e,
    0xc96,
    0x41a95,
    0xd4a,
    0xda5,
    0x20b55,
    0x56a,
    0x7155b,
    0x25d,
    0x92d,
    0x5192b,
    0xa95,
    0xb4a,
    0x416aa,
    0xad5,
    0x90ab5,
    0x4ba,
    0xa5b,
    0x60a57,
    0x52b,
    0xa93,
    0x40e95
  ]
};

function getLunarDate(date: Date | number) {
  var year, month, day;
  let _date = date;

  if (typeof _date === "number") _date = new Date(_date);
  if (!_date && Object.prototype.toString.call(_date) !== "[object Date]")
    _date = new Date();
  (year = _date.getFullYear()),
    (month = _date.getMonth()),
    (day = _date.getDate());

  if (year < 1921 || year > 3000) {
    return {};
  }

  var total, m, n, k, bit, lunarYear, lunarMonth, lunarDay;
  var isEnd = false;
  var tmp = year;
  if (tmp < 1900) {
    tmp += 1900;
  }
  total =
    (tmp - 1921) * 365 +
    Math.floor((tmp - 1921) / 4) +
    lunar.monthadd[month] +
    day -
    38;
  if (year % 4 === 0 && month > 1) {
    total++;
  }
  for (m = 0; ; m++) {
    k = lunar.calendar[m] < 0xfff ? 11 : 12;
    for (n = k; n >= 0; n--) {
      bit = (lunar.calendar[m] >> n) & 1;
      if (total <= 29 + bit) {
        isEnd = true;
        break;
      }
      total = total - 29 - bit;
    }
    if (isEnd) break;
  }
  lunarYear = 1921 + m;
  lunarMonth = k - n + 1;
  lunarDay = total;
  if (k === 12) {
    if (lunarMonth === Math.floor(lunar.calendar[m] / 0x10000) + 1) {
      lunarMonth = 1 - lunarMonth;
    }
    if (lunarMonth > Math.floor(lunar.calendar[m] / 0x10000) + 1) {
      lunarMonth--;
    }
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay
  };
}

const sixteen2Rgb = (color: string, fn: (rgb: Array<number | string>) => string) => {
  const reg16 = /^#[0-9a-fA-F]{3}|[0-9a-fA-F]{6}$/;
  if (!reg16.test(color)) return color;
  const numArr = color.slice(1).split("");
  const len = numArr.length;
  if (len === 3) {
    return fn(
      numArr.map(num => {
        return parseInt(num + num, 16);
      })
    );
  } else if (len === 6) {
    let colorArr = new Array(3).fill("");
    let i = 0;
    numArr.forEach(num => {
      if (colorArr[i].length === 2) i++;
      colorArr[i] += num;
    });
    return fn(colorArr.map(color => parseInt(color, 16)));
  }
};

export { getDateName, sixteen2Rgb };
