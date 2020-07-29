import { Component } from 'refast'
import { Carousel } from 'antd-mobile'
import Calendar from './index'

/**
 * value
 * onPageChange
 * onChange
 * hotDateList
 */
export default class extends Component {

  constructor() {
    super(...arguments)
    const { value } = this.props
    const realDate = new Date(value)
    const year = realDate.getFullYear()
    const month = realDate.getMonth()
    this.state = {
      past: new Date(year, month - 1),
      now: value,
      next: new Date(year, month + 1),
      active: 0,
      collapse: false
    }
  }

  handleChange = (from, to) => {
    if(from === to) return
    const { collapse } = this.state
    const { now, next, past } = this.state
    const DOC = [ { now }, { next }, { past } ]
    this.setState({
      active: to,
      ...(collapse ? this.handleBsideChange(from, to, DOC) : (typeof from === 'number' && typeof to === 'number' ? this.handleMonthChange(from, to, DOC) : this.handleBsideChange(from, to, DOC, 'month', 1)))
    }, () => {
      this.props.onPageChange && this.props.onPageChange(from, to)
    })
  }

  //type = date | month | year
  handleBsideChange = (_, to, DOC, type='date', process=7) => {
    let past = to - 1
    let next = to + 1
    const [nowDate] = Object.values(DOC[to])
    if(past < 0) past = 2
    if(next > 2) next = 0 
    const [pastKey] = Object.keys(DOC[past])
    const [nextKey] = Object.keys(DOC[next])
    const year = nowDate.getFullYear()
    const month = nowDate.getMonth()
    const day = nowDate.getDate()
    return {
      [pastKey]: new Date(type === 'year' ? year - process : year , type === 'month' ? month - process : month, type === 'date' ? day - process : day),
      [nextKey]: new Date(type === 'year' ? year + process : year , type === 'month' ? month + process : month, type === 'date' ? day + process : day),
    }
  }

  handleMonthChange = (from, to, DOC) => DOC.reduce((acc, item, index) => {
      const [key] = Object.keys(item)
      if(index === to || index === from) return acc
      //判断确定需要改变时间的具体计算
      const [toDate] = Object.values(DOC[to])
      const [fromDate] = Object.values(DOC[from])
      let calc = toDate > fromDate ? 1 : -1
      const newDate = new Date(toDate.getFullYear(), toDate.getMonth() + calc)
      acc = {
        ...acc,
        ...{ [key]: newDate }
      }
      return acc
    }, {})

  handleSelectDate = (date) => {
    const { now, past, next, active } = this.state
    const dates = [now, next, past]
    const activeDate = dates[active]
    if(date.getFullYear() === activeDate.getFullYear() && date.getMonth() === activeDate.getMonth()) {
      this.props.onChange && this.props.onChange(date)
    }
  }

  isThisDate = (date) => {
    const { value } = this.props
    const { collapse } = this.state
    if(!collapse) return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth()
    if(!this.calendarRef) return false
    const [start, end] = this.calendarRef.getThisWeek(date)
    return (start.getTime() <= value.getTime() && end.getTime() >= value.getTime())
  }

  getActiveDate = () => {
    const { active, now, next, past } = this.state
    return [now, next, past][active]
  }

  getRealData = (date) => {
    const { value } = this.props
    return this.isThisDate(date) ? value : date
  }

  handleCollapse = () => {
    const { collapse, active, now, next, past } = this.state
    const DOC = [{now}, {next}, {past}]
    this.setState({
      collapse: !collapse
    }, () => {
      this.handleChange(null, active, DOC)
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
            ref={el => this.calendarRef = el}
            collapse={collapse}
            hotDateList={hotDateList}
            onChange={(date) => this.handleSelectDate.call(this, date, 0)}
            value={this.getRealData(now)}
            showToday={this.isThisDate(now)}
          ></Calendar>
          <Calendar
            collapse={collapse}
            showToday={this.isThisDate(next)}
            hotDateList={hotDateList}
            onChange={(date) => this.handleSelectDate.call(this, date, 1)}
            value={this.getRealData(next)}
          ></Calendar>
          <Calendar
            collapse={collapse}
            showToday={this.isThisDate(past)}
            hotDateList={hotDateList}
            onChange={(date) => this.handleSelectDate.call(this, date, 2)}
            value={this.getRealData(past)}
          ></Calendar>
        </Carousel>
        <div onClick={this.handleCollapse} style={{textAlign: 'center', fontSize: '1em', fontWeight: 'bolder', color: '#00CC73', textShadow: '0 0 10px #00cc73'}}>{collapse ? '↓' : '↑'}</div>
      </div>
    )
  }

}