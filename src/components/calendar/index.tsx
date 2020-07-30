import React, { Component, ReactNode } from "react";
import { getDateName, sixteen2Rgb } from "./utils";
import "./index.css";

export interface CalendarProps {
  collapse?: boolean
  lunerVisible?: boolean
  showToday?: boolean
  showWeek?: boolean
  activeStyle?: any
  value?: false | Date | number
  hot?: false | Array<Date> | ((date: Date) => boolean)
  renderHeader?: false | ((date: Date) => ReactNode)
  renderFooter?: false | ((date: Date) => ReactNode)
  renderDateFooter?: false | ((date: Date) => ReactNode)
  onChange: false | ((date: Date) => any)
  colorStyle?: string
  showLastNext?: boolean
}

interface CalendarState {
  date: Date
}

interface ItemWeekType {
  type: EDateType
  value: string | number
}

interface ItemDateType extends ItemWeekType {
  date: Date
}

enum EDateChangeType {
  'year',
  'month',
  'week',
  'day'
}

enum EDateType {
  'week',
  'now',
  'last',
  'next'
}

const DEFAULT_COLOR_STYLE = '#00CC73'

class Calendar extends Component<CalendarProps, CalendarState> {
  public static defaultProps: CalendarProps = {
    collapse: false,
    lunerVisible: true,
    showToday: true,
    showWeek: false,
    activeStyle: {},
    value: false,
    hot: false, 
    renderHeader: false,
    renderFooter: false,
    renderDateFooter: false,
    colorStyle: DEFAULT_COLOR_STYLE,
    onChange: false,
    showLastNext: true
  };

  public constructor(props: CalendarProps) {
    super(props);
    const { value } = props;
    let realDate;
    if (
      !value ||
      (typeof value !== "number" &&
      Object.prototype.toString.call(value) !== "[object Date]")
    ) {
      realDate = new Date();
    } else {
      realDate = new Date(value);
    }
    this.state = {
      date: realDate
    };
  }

  public componentDidUpdate = (prevProps: CalendarProps) => {
    const { value: prevValue } = prevProps;
    const { value } = this.props;
    if (
      !!value &&
      prevValue !== value &&
      (typeof value === "number" ||
        Object.prototype.toString.call(value) === "[object Date]")
    ) {
      let realDate:Date = new Date(value);
      this.setState({
        date: realDate
      });
    }
  };

  readonly week: Array<ItemWeekType> = [
    {
      type: EDateType.week,
      value: "日"
    },
    {
      type: EDateType.week,
      value: "一"
    },
    {
      type: EDateType.week,
      value: "二"
    },
    {
      type: EDateType.week,
      value: "三"
    },
    {
      type: EDateType.week,
      value: "四"
    },
    {
      type: EDateType.week,
      value: "五"
    },
    {
      type: EDateType.week,
      value: "六"
    }
  ];

  // private _value:Date

  public get value(){
    return this.state.date
  }

  private handleClick = (item: ItemDateType) => {
    const { date } = item;
    const { value } = this.props;
    if (!value) {
      this.setState({
        date
      });
    }
    this.props.onChange && this.props.onChange(date);
  };

  //获取当前月第一天(周)
  public getMonthStart = (
    month:number = new Date().getMonth() + 1,
    year:number = new Date().getFullYear()
  ):Date => new Date(year, month - 1);

  //获取月最后一天(周)
  public getMonthEnd = (
    month:number = new Date().getMonth() + 1,
    year:number = new Date().getFullYear()
  ):Date => new Date(year, month, 0);

  //获取当前月天数
  public getMonthDays = (
    month:number = new Date().getMonth() + 1,
    year:number = new Date().getFullYear()
  ): number => new Date(year, month, 0).getDate();

  //获取需要显示的日期数据
  private getVisibleDate = (): Array<ItemWeekType | ItemDateType> => {
    const { collapse, showLastNext } = this.props;
    const { date } = this.state;

    const month:number = date.getMonth() + 1;
    const year:number = date.getFullYear();
    const day:number = date.getDate()

    let visibleDate:Array<ItemWeekType | ItemDateType> = [...this.week];

    //非折叠
    if(!collapse) {
      const first: number = this.getMonthStart(month, year).getDay();
      const last: number = this.getMonthEnd(month, year).getDay();
      const _date: Date = new Date(year, month - 2);
      const prevMonthDays = this.getMonthDays(
        _date.getMonth() + 1,
        _date.getFullYear()
      );

      visibleDate = [
        ...visibleDate,
        ...new Array(showLastNext ? first : 0).fill(0).map((_, index) => ({
          type: EDateType.last,
          value: prevMonthDays - first + index + 1,
          date: new Date(year, month - 2, prevMonthDays - first + index + 1)
        })),
        ...new Array(this.getMonthDays(month, year)).fill(0).map((_, index) => ({
          type: EDateType.now,
          value: index + 1,
          date: new Date(year, month - 1, index + 1)
        })),
        ...new Array(showLastNext ? 6 - last : 0).fill(0).map((_, index) => ({
          type: EDateType.next,
          value: index + 1,
          date: new Date(year, month, index + 1)
        }))
      ];
      return visibleDate
    }

    //折叠
    let [weekStart] = this.getThisWeek(new Date(year, month - 1, day));
    visibleDate = [
      //更改顺序
      ...[...visibleDate.slice(1), ...visibleDate.slice(0, 1)],
      ...new Array(7).fill(0).map(_ => {
        const date = {
          type: EDateType.now,
          value: weekStart.getDate(),
          date: new Date(weekStart)
        }
        weekStart.setDate(weekStart.getDate() + 1)
        return date
      })
    ]
    return visibleDate
  };

  //时间改变
  private changeDate = (type: EDateChangeType, isNext: boolean, _value: false | Date=false): Date => {
    const { date } = this.state;
    const { value } = this.props
    const _date:Date = new Date((!!_value && _value) || (!!value && value) || date)
    const year: number = _date.getFullYear();
    const month: number = _date.getMonth() + 1;
    const day: number = _date.getDate();
    const realDate: Date = new Date(year, month - 1, day);
    const num = Math.pow(-1, Number(isNext));
    switch (type) {
      case EDateChangeType.week:
        realDate.setDate(day + 7 * num);
        break;
      case EDateChangeType.month:
        realDate.setMonth(month - 1 + num);
        break;
      case EDateChangeType.year:
        realDate.setFullYear(year + num);
        break;
      case EDateChangeType.day:
      default:
        realDate.setDate(day + num);
        break;
    }
    if(_value === false && value === false) {
      this.setState({
        date: realDate
      });
    }else if(_value === false) {
      this.props.onChange && this.props.onChange(realDate)
    }
    return realDate
  };

  public next = (type: EDateChangeType, date?: Date) => this.changeDate(type, true, date);

  public last = (type: EDateChangeType, date?: Date) => this.changeDate(type, false, date);

  public lastYear = (date?: Date) => this.last(EDateChangeType.year, date);

  public lastMonth = (date?: Date) => this.last(EDateChangeType.month, date);

  public lastWeek = (date?: Date) => this.last(EDateChangeType.week, date);

  public lastDay = (date?: Date) => this.last(EDateChangeType.day, date);

  public nextYear = (date?: Date) => this.next(EDateChangeType.year, date);

  public nextMonth = (date?: Date) => this.next(EDateChangeType.month, date);

  public nextWeek = (date?: Date) => this.next(EDateChangeType.week, date);

  public nextDay = (date?: Date) => this.next(EDateChangeType.day, date);

  public getThisWeek = (date: Date): [Date, Date] => {
    const weekDay:number = date.getDay();
    const day: number = date.getDate();
    const year: number = date.getFullYear();
    const month: number = date.getMonth();
    return [
      new Date(year, month, day - weekDay + 1),
      new Date(year, month, day + 7 - weekDay)
    ];
  };

  //是否为active区域
  private isActive = ({ type, date: value }: ItemDateType): boolean => {
    const { showToday, showWeek } = this.props;
    const { date } = this.state;
    
    if (showWeek) {
      const [start, end] = this.getThisWeek(date);
      return (
        start.getTime() <= value.getTime() && end.getTime() >= value.getTime()
      );
    } else if (showToday) {
      return date.getDate() === value.getDate() && type === EDateType.now;
    }
    return false;
  };

  private basicColor = () => ({ color: this.props.colorStyle || DEFAULT_COLOR_STYLE });

  private itemColorStyle = (type: EDateType) => ({
    color:
      type !== EDateType.now
        ? sixteen2Rgb(
            this.props.colorStyle || DEFAULT_COLOR_STYLE,
            rgb =>
              `rgb(${new Array(3)
                .fill(
                  Math.floor(rgb.reduce((acc: number, item: any) => (acc += item), 0) / 3)
                )
                .join(",")}, 0.8)`
          )
        : sixteen2Rgb(
            this.props.colorStyle || DEFAULT_COLOR_STYLE,
            rgb =>
              `rgb(${new Array(3).fill(
                Math.floor(rgb.reduce((acc, item: any) => (acc += item), 0) / 5)
              )})`
          )
  });

  private dateColorStyle = (item: ItemDateType, nextStyle: any) => ({
    ...(this.isActive(item)
      ? {
          backgroundColor: this.props.colorStyle,
          color: sixteen2Rgb(
            this.props.colorStyle || DEFAULT_COLOR_STYLE,
            rgb => `rgb(${rgb.map(color => 255 - +color).join(",")})`
          ),
          ...nextStyle
        }
      : {})
  });

  private lunerColorStyle = (active: boolean) => ({
    color: active
      ? sixteen2Rgb(this.props.colorStyle || DEFAULT_COLOR_STYLE, rgb => {
          const max = Math.max.apply(null, rgb);
          const index = rgb.indexOf(max);
          const newRgb = new Array(3).fill(0);
          newRgb[index] = max;
          return `rgb(${newRgb.join(",")})`;
        })
      : sixteen2Rgb(
          this.props.colorStyle || DEFAULT_COLOR_STYLE,
          rgb =>
            `rgb(${new Array(3)
              .fill(Math.floor(rgb.reduce((acc: number, item: any) => (acc += item), 0) / 3))
              .join(",")}, 0.6)`
        )
  });

  private hotColorStyle = () => ({
    backgroundColor: sixteen2Rgb(this.props.colorStyle || DEFAULT_COLOR_STYLE, rgb => {
      const max = Math.max.apply(null, rgb);
      const index = rgb.indexOf(max);
      const newRgb = new Array(3).fill(0);
      newRgb[index] = max * 2 > 255 ? 255 : max * 2;
      return `rgb(${newRgb.join(",")})`;
    })
  });

  public render() {
    const {
      collapse,
      lunerVisible,
      activeStyle,
      hot,
      showLastNext
    } = this.props;
    const { date } = this.state;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const list = this.getVisibleDate();

    return (
      <div className="glf-calendar">
        {this.props.renderHeader && (
          <div className="glf-calendar-header">
            {this.props.renderHeader(new Date(year, month - 1, day))}
          </div>
        )}
        <div
          className="glf-calendar-content"
          style={{
            gridTemplateRows: `repeat(${
              collapse ? 2 : Math.ceil(list.length / 7)
            }, 1fr)`
          }}
        >
          {list.map((item: any, index: number) => {
            const { value, date, type } = item;
            const { holiday, active } = getDateName(date);
            const day = date && date.getDay();
            return (index <= 6) ? (
              <div
                key={index}
                className="glf-calendar-item glf-calendar-content-week"
                style={{ ...this.basicColor() }}
              >
                {value}
              </div>
            ) : (
              <div
                key={index}
                className={`glf-calendar-item glf-calendar-content-days`}
                style={{
                  ...(!showLastNext && type === EDateType.now && date.getDate() === 1
                    ? { gridColumnStart: date.getDay() + 1 }
                    : {}),
                  ...this.itemColorStyle(type)
                }}
                onClick={this.handleClick.bind(this, item)}
              >
                <div className="glf-calendar-item-main">
                  <div
                    className={`glf-calendar-date ${
                      this.isActive(item) ? "glf-calendar-default-active" : ""
                    }`}
                    style={{
                      ...this.dateColorStyle(item, activeStyle),
                      fontWeight: day === 0 || day === 6 ? "500" : "400"
                    }}
                  >
                    {value}
                  </div>
                  {lunerVisible && (
                    <div
                      className={`glf-calendar-lunar`}
                      style={{ ...this.lunerColorStyle(active) }}
                    >
                      {holiday}
                    </div>
                  )}
                </div>
                {hot &&
                  (Array.isArray(hot)
                    ? hot.some(
                        hotDate =>
                          Object.prototype.toString.call(hotDate) ===
                            "[object Date]" &&
                          hotDate.getFullYear() === date.getFullYear() &&
                          hotDate.getMonth() === date.getMonth() &&
                          hotDate.getDate() === date.getDate()
                      )
                    : typeof hot === "function"
                    ? hot(date)
                    : false) && (
                    <div
                      className="glf-calendar-hot"
                      style={{ ...this.hotColorStyle() }}
                    />
                  )}
                <div className="glf-calendar-slot">
                  {this.props.renderDateFooter
                    ? typeof this.props.renderDateFooter === "function"
                      ? this.props.renderDateFooter(date)
                      : this.props.renderDateFooter
                    : ""}
                </div>
              </div>
            );
          })}
        </div>
        {this.props.renderFooter && (
          <div className="glf-calendar-footer">
            {this.props.renderFooter(new Date(year, month - 1, day))}
          </div>
        )}
      </div>
    );
  }
}

export default Calendar