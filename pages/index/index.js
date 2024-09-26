import NP from 'number-precision'
Page({
    data: {
        dateConfig: { // 年月日配置项
            currentDate: new Date().getTime(),
            // minDate: new Date(new Date().getFullYear() - 1, 11, 1).getTime(),
            // maxDate: new Date(new Date().getFullYear() + 1, 0, 31).getTime(),
            minDate: new Date().getTime() - 24 * 60 * 60 * 1000 * 14,
            maxDate: new Date().getTime() + 24 * 60 * 60 * 1000 * 14,
        },
        timeConfig: { // 时分配置项
            minHour: 0,
            maxHour: 23,
            minMinute: 0,
            maxMinute: 59,
            currentDate: '20:00'
        },
        formatter(type, value) {
            const format = {
                year: `${value}年`,
                month: `${value}月`,
                day: `${value}日`,
                // hour: `${value}时`,
                // minute: `${value}分`
            };
            return format[type] || value;
        },
        filter(type, options) {
            if (type === 'minute') {
                return options.filter((option) => option % 15 === 0);
            }
            return options;
        },
        activity: {
            date: '',
            sTime: '20:00',
            eTime: '22:00',
            time: '',
            people: ''
        },
        site: {
            name: '',
            price: '',
            averagePrice: '',
        },
        ball: {
            name: '',
            num: '',
            priceType: 1, // 球价计算类型，  0：桶（12/桶） / 1： 个 
            unitPrice: '',
            totalPrice: '',
            averagePrice: ''
        },
        amount: {
            price: '0.00',
            averagePrice: '0.00'
        }
    },

    onLoad() {
        const today = this.formatTime(new Date().getTime(), 'yyyy-MM-dd')
        this.setData({
            'activity.date': today,
            'activity.time': `${today}  20:00-22:00`
        })
    },

    showTimePopup() {
        this.setData({ showTimePopup: true })
    },

    hideTimePopup() {
        this.setData({ showTimePopup: false })
    },

    confirmTime() {
        const { date, sTime, eTime } = this.data.activity
        this.setData({
            showTimePopup: false,
            'activity.time': `${date}  ${sTime} - ${eTime}`
        })
    },

    onTimeInput(e) {
        const { type, filterType } = e.currentTarget.dataset;
        const detail = e.detail;

        if (type === 'sTime' || type === 'eTime') {
            this.setData({ [`activity.${type}`]: detail });
        }
        if (type === 'date') {
            const value = this.formatTime(detail, filterType);
            this.setData({
                'activity.date': value,
                'dateConfig.currentDate': detail
            });
        }
    },

    chooseLocation() {
        wx.chooseLocation({
            success: (res) => this.setData({ 'site.name': res.name })
        })

    },

    getInputValue(e) {
        const type = e.currentTarget.dataset.type
        const detail = e.detail
        console.log(detail);
        if (type == 'people') {
            this.setData({ 'activity.people': detail })
        }
        if (type == 'site') {
            this.setData({ 'site.price': detail })
            !detail && this.setData({ 'site.averagePrice': '' })
        }
        if (type == 'ballNum') {
            this.setData({ 'ball.num': detail })
            !detail && this.setData({ 'ball.totalPrice': '', 'ball.averagePrice': '' })
        }
        if (type == 'ballUnitPrice') {
            this.setData({ 'ball.unitPrice': detail })
            !detail && this.setData({ 'ball.totalPrice': '', 'ball.averagePrice': '' })
        }
        this.countPrice()
    },

    countPrice() {
        const { activity, ball, site } = this.data
        if (!activity.people) return
        if (ball.num && ball.unitPrice) {
            const totalPrice = ball.priceType ? NP.round(NP.times(ball.num, ball.unitPrice), 2) : NP.round(NP.times(ball.num, NP.divide(ball.unitPrice, 12)), 2)
            const averagePrice = NP.round(NP.divide(totalPrice, activity.people), 2)
            this.setData({
                'ball.totalPrice': totalPrice,
                'ball.averagePrice': averagePrice
            })
        }
        if (site.price) {
            this.setData({ 'site.averagePrice': NP.round(NP.divide(site.price, activity.people), 2) })
        }
        if (ball.totalPrice && site.price) {
            const price = NP.plus(ball.totalPrice, site.price)
            this.setData({
                'amount.price': price,
                'amount.averagePrice': NP.round(NP.divide(price, activity.people), 2)
            })
        }

    },

    async selectBallPriceType() {
        const res = await wx.showActionSheet({ itemList: ['桶（12个）', '个'] }).fail()
        this.setData({ 'ball.priceType': res.tapIndex })
        this.countPrice()
    },

    formatTime(timestamp, format) {
        const formatArr = ['yyyy', 'MM', 'dd', 'HH', 'm'];
        const formatNumber = n => n.toString().padStart(2, '0');
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const returnArr = [year, month, day, hour, minute, second].map(formatNumber);
        formatArr.forEach((item, i) => format = format.replace(item, returnArr[i]));
        return format;
    },


})
