import React, { Component } from 'react'
import { Carousel } from 'antd-mobile'
import Calendar from '../calendar'
import { noop } from 'lodash'

export interface CarouselCalendarProps {
  value: Date | number
  hotDateList?: false | Array<Date> | ((date: Date) => boolean)
  onPageChange?: (from: number | null, to: number) => any
  onChange?: (date: Date) => any
}

interface CarouselCalendarState {
  past: Date
  now: Date
  next: Date
  active: number
  collapse: boolean
}

enum EDateChangeType {
  'date',
  'month',
  'year'
}

type TDoc = [ { now: Date }, { next: Date }, { past: Date } ]

export default class extends Component<CarouselCalendarProps, CarouselCalendarState> {

  public static defaultProps: CarouselCalendarProps = {
    value: new Date(),
    hotDateList: false,
    onPageChange:noop,
    onChange: noop
  }

  public constructor(props: CarouselCalendarProps) {
    super(props)
    const { value } = props
    const realDate = new Date(value ? value : new Date())
    const year = realDate.getFullYear()
    const month = realDate.getMonth()

    this.state = {
      past: new Date(year, month - 1),
      now: realDate,
      next: new Date(year, month + 1),
      active: 0,
      collapse: false
    }
  }

  public componentDidUpdate = (prevProps: CarouselCalendarProps) => {
    const { value:nowValue } = this.props
    const { value:prevValue } = prevProps
    const realNowValue = new Date(nowValue)
    const realPrevValue = new Date(prevValue)
    const { now, next, past, active, collapse } = this.state

    if(collapse) return

    //当前活跃页未在指定日期范围内，则整体切换日历
    if(realPrevValue.getFullYear() !== realNowValue.getFullYear() || realPrevValue.getMonth() !== realNowValue.getMonth()) {
      const DOC: TDoc = [ { now }, { next }, { past } ]
      const activeDate = DOC[active]
      const [activeKey]: any = Object.keys(activeDate)
      const newDate: any = { [activeKey]: realNowValue }
      DOC.splice(active, 1, newDate)
      this.setState({
        ...this.handleBsideChange(null, active, DOC, EDateChangeType.month, 1),
        ...newDate
      }, () => {
        console.log(this.state)
        this.props.onPageChange && this.props.onPageChange(active, active)
      })
    }
  }

  calendarRef = React.createRef<Calendar>()

  private handleChange = (from: number | null, to: number) => {
    if(from === to) return
    const { collapse } = this.state
    const { now, next, past } = this.state
    const DOC: TDoc = [ { now }, { next }, { past } ]

    this.setState({
      active: to,
      ...(collapse ? this.handleBsideChange(from, to, DOC) : (typeof from === 'number' && typeof to === 'number' ? this.handleMonthChange(from, to, DOC) : this.handleBsideChange(from, to, DOC, EDateChangeType.month, 1)))
    }, () => {
      this.props.onPageChange && this.props.onPageChange(from, to)
    })
  }

  private handleBsideChange = (_: null | number, to: number, DOC: TDoc, type:EDateChangeType=EDateChangeType.date, process:number=7):{ [key: string]: Date } => {
    let past:number = to - 1
    let next:number = to + 1
    const [nowDate]: Date[] = Object.values(DOC[to])
    if(past < 0) past = 2
    if(next > 2) next = 0 
    const [pastKey]: string[] = Object.keys(DOC[past])
    const [nextKey]: string[] = Object.keys(DOC[next])
    const year:number = nowDate.getFullYear()
    const month:number = nowDate.getMonth()
    const day:number = nowDate.getDate()
    return {
      [pastKey]: new Date(type === EDateChangeType.year ? year - process : year , type === EDateChangeType.month ? month - process : month, type === EDateChangeType.date ? day - process : day),
      [nextKey]: new Date(type === EDateChangeType.year ? year + process : year , type === EDateChangeType.month ? month + process : month, type === EDateChangeType.date ? day + process : day),
    }
  }

  private handleMonthChange = (from: number, to: number, DOC: TDoc): { [key: string]: Date } => DOC.reduce((acc, item, index) => {
      const [key]: string[] = Object.keys(item)
      if(index === to || index === from) return acc
      //判断确定需要改变时间的具体计算
      const [toDate]: Date[] = Object.values(DOC[to])
      const [fromDate]: Date[] = Object.values(DOC[from])
      let calc: number = toDate > fromDate ? 1 : -1
      const newDate: Date = new Date(toDate.getFullYear(), toDate.getMonth() + calc)
      acc = {
        ...acc,
        ...{ [key]: newDate }
      }
      return acc
    }, {})

  private handleSelectDate = (date: Date) => this.props.onChange && this.props.onChange(date)

  private isThisDate = (date: Date) => {
    const { value } = this.props
    const { collapse } = this.state
    const realDate = new Date(value ? value : new Date())

    if(!collapse) return realDate.getFullYear() === date.getFullYear() && realDate.getMonth() === date.getMonth()
    if(!this.calendarRef) return false
    const [start, end] = this.calendarRef.current!.getThisWeek(date)
    return (start.getTime() <= realDate.getTime() && end.getTime() >= realDate.getTime())
  }

  public getActiveDate = ():Date => {
    const { active, now, next, past } = this.state
    return [now, next, past][active]
  }

  getRealData = (date: Date) => {
    const { value } = this.props
    return this.isThisDate(date) ? value : date
  }

  handleCollapse = () => {
    const { value } = this.props
    const realValue = new Date(value)
    const { collapse, active, now, next, past } = this.state
    const DOC:TDoc = [ {now}, {next}, {past} ]
    const activeDate = DOC[active]
    const [activeKey]:any = Object.keys(activeDate)
    const newDate = { [activeKey]: realValue }
    this.setState({
      ...newDate,
      collapse: !collapse
    }, () => {
      this.handleChange(null, active)
    })
  }

  render() {

    const { hotDateList } = this.props
    const { past, now, next, collapse } = this.state

    return (
      <div>
        <Carousel
          dots={false}
          infinite
          beforeChange={this.handleChange}
        >
          <Calendar
            ref={this.calendarRef}
            collapse={collapse}
            hot={hotDateList}
            onChange={(date) => this.handleSelectDate.call(this, date, 0)}
            value={this.getRealData(now)}
            showToday={this.isThisDate(now)}
          ></Calendar>
          <Calendar
            collapse={collapse}
            showToday={this.isThisDate(next)}
            hot={hotDateList}
            onChange={(date) => this.handleSelectDate.call(this, date, 1)}
            value={this.getRealData(next)}
          ></Calendar>
          <Calendar
            collapse={collapse}
            showToday={this.isThisDate(past)}
            hot={hotDateList}
            onChange={(date) => this.handleSelectDate.call(this, date, 2)}
            value={this.getRealData(past)}
          ></Calendar>
        </Carousel>
        <div onClick={this.handleCollapse} style={{textAlign: 'center', fontSize: '1em', fontWeight: 'bolder', color: '#00CC73', textShadow: '0 0 10px #00cc73'}}>{collapse ? '↓' : '↑'}</div>
      </div>
    )
  }

}