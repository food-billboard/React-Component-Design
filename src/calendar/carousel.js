import { Component } from 'refast'
import { Carousel } from 'antd-mobile'
import Calendar from './index'

export default class extends Component {

  static defaultProps = {
    
  }

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
    }
  }

  handleChange = (from, to) => {
    const { now, next, past } = this.state
    const DOC = [ { now }, { next }, { past } ]
    this.setState({
      active: to,
      ...(DOC.reduce((acc, item, index) => {
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
      }, {}))
    }, () => {
      this.props.onPageChange && this.props.onPageChange(from, to)
    })
  }

  handleSelectDate = (date) => {
    this.props.onChange && this.props.onChange(date)
  }

  isThisDate = (date) => {
    const { value } = this.props
    return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth()
  }

  getActiveDate = () => {
    const { active, now, next, past } = this.state
    return [now, next, past][active]
  }

  getRealData = (date) => {
    const { value } = this.props
    value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth() ? value : date
  }

  render() {

    const { hotDateList } = this.props
    const { past, now, next } = this.state

    return (
      <Carousel
        dots={false}
        infinite
        beforeChange={this.handleChange}
      >
        <Calendar
          hotDateList={hotDateList}
          onChange={(date) => this.handleSelectDate.call(this, date, 0)}
          value={this.getRealData(now)}
          showToday={this.isThisDate(now)}
        ></Calendar>
        <Calendar
          showToday={this.isThisDate(next)}
          hotDateList={hotDateList}
          onChange={(date) => this.handleSelectDate.call(this, date, 1)}
          value={this.getRealData(next)}
        ></Calendar>
        <Calendar
          showToday={this.isThisDate(past)}
          hotDateList={hotDateList}
          onChange={(date) => this.handleSelectDate.call(this, date, 2)}
          value={this.getRealData(past)}
        ></Calendar>
      </Carousel>
    )
  }

}