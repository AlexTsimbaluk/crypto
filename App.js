import React, {Component} from 'react';
import {Platform, StyleSheet, ScrollView, Text, View} from 'react-native';

import axios from 'axios';


// отключаем варнинги
console.disableYellowBox = true;

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dataRecieved: false,
            // свежие данные
            cryptos: {},
            // предыдущие данные
            __cryptos: {},
            // свойство указывает на то, был ли создан __cryptos
            prevCreated: false,
            start: 0
        };
    }

    render() {
        return (
            <ScrollView horizontal={true} style={styles._container}>
                <Cryptos cryptos={this.state.cryptos} />
            </ScrollView>
        );
    }

    componentDidMount() {
        this.getData();
    }

    getData () {
        axios
            .get('https://api.coinmarketcap.com/v2/ticker/')
            .then((response) => {
                try {
                    let data = response.data.data;

                    for (var obj in data) {
                        let crypto = data[obj];

                        for (var key in crypto) {
                            if (key == 'website_slug') {
                                delete crypto[key];
                            }

                            if (key == 'quotes') {
                                let quote = crypto[key]['USD'];
                                delete crypto[key];

                                for (var name in quote) {
                                    if (name == 'price') {
                                        crypto[name] = quote[name];
                                    }

                                    if (name == 'volume_24h') {
                                        crypto[name] = quote[name];
                                    }

                                    if (name == 'market_cap') {
                                        crypto[name] = quote[name];
                                    }

                                    if (name == 'percent_change_1h') {
                                        crypto[name] = quote[name];
                                    }

                                    if (name == 'percent_change_24h') {
                                        crypto[name] = quote[name];
                                    }

                                    if (name == 'percent_change_7d') {
                                        crypto[name] = quote[name];
                                    }
                                }
                            }

                            if (key == 'last_updated') {
                                crypto[key] = this.dateFromTimestap(crypto[key]);
                            }
                        }

                        if (this.state.cryptos[obj] == undefined) {
                            // console.log('First request');
                        } else {
                            // Data updated
                            if (crypto['price'] != this.state.cryptos[obj]['price']) {
                                let end = Date.now()
                                console.log(this.getInterval(end - this.state.start) + ' sec from previous update');
                                // this.state.start = end;
                                this.setState((prevState, props) => ({
                                    start: end
                                }));

                                this.createTemp();

                                for (var key in this.state.__cryptos[obj]) {
                                    let val = crypto[key];
                                    let __val = this.state.__cryptos[obj][key];

                                    // console.log(__val);
                                    // console.log(val);

                                    let diff = val - __val;

                                    if (diff > 0) {
                                        // console.log(key + ' - up');
                                    } else if (diff < 0) {
                                        // console.log(key + ' - down');
                                    } else {
                                        // console.log(key + ' - not changed');
                                    }
                                }
                            }
                        }
                    }

                    // this.state.cryptos = data;
                    this.setState((prevState, props) => ({
                        cryptos: data
                    }));

                    /*if (!this.state.prevCreated) {
                        this.createTemp();
                    }*/

                    // this.state.dataRecieved = true;
                    this.setState((prevState, props) => ({
                        dataRecieved: true
                    }));
                } catch(e) {
                    console.log('Error::No response');
                    throw new Error(e);
                }
            })
            .catch((error) => {
                console.log('Error::не удалось создать ajax-запрос');
                console.log(error)
            });
    }

    dateFromTimestap (sec) {
        return new Date(sec * 1e3).toISOString().slice(-13, -5);
    }

    getInterval (sec) {
        return Math.round(sec / 1000);
    }

    createTemp () {
        // this.state.__cryptos = this.state.cryptos;
        this.setState((prevState, props) => ({
            __cryptos: this.state.cryptos
        }));

        for (var obj in this.state.__cryptos) {
            let crypto = this.state.__cryptos[obj];

            for (var key in crypto) {
                if (key == 'id') delete crypto[key];
                if (key == 'name') delete crypto[key];
                if (key == 'symbol') delete crypto[key];
                if (key == 'rank') delete crypto[key];
                if (key == 'circulating_supply') delete crypto[key];
                if (key == 'max_supply') delete crypto[key];
                if (key == 'total_supply') delete crypto[key];
                if (key == 'last_updated') delete crypto[key];
            }
        }

        // this.state.prevCreated = true;
        this.setState((prevState, props) => ({
            prevCreated: true
        }));
    }

}

class Cryptos extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ScrollView>
                {
                    Object.keys(this.props.cryptos).map( (elem, i)=> (
                        <Currency key={i} crypto={this.props.cryptos[elem]} />
                    ))
                }
            </ScrollView>
        );
    }
}

class Currency extends Component {
    constructor(props) {
        super(props);

        /*Object.keys(this.props.crypto)
            .forEach((elem) => {
                console.log(elem);
            });*/
    }

    render() {
        return (
            <View style={styles._tr}>
                {
                    Object.keys(this.props.crypto)
                        // .filter((elem, i) => this.props.crypto[elem] != null)
                        .map((elem, i) => (
                            <Value key={i} dataName={elem} value={this.props.crypto[elem]} />
                        ))
                }
            </View>
        );
    }
}

class Value extends Component {
    constructor(props) {
        super(props);
    }

            // <View style={styles._td}>
    render() {
        return (
            <View style={[styles._td, this.getStyle(this.props.dataName)]}>
                <Text style={styles._td_text}>{this.props.value}</Text>
            </View>
        );
    }

    getStyle(tdName) {
        let style;

        switch(tdName) {
            case 'id':
                style = styles.td_id;
                break;

            case 'name':
                style = styles.td_name;
                break;

            case 'symbol':
                style = styles.td_symbol;
                break;

            case 'rank':
                style = styles.td_rank;
                break;

            case 'circulating_supply':
                style = styles.td_circulating_supply;
                break;

            case 'total_supply':
                style = styles.td_total_supply;
                break;

            case 'max_supply':
                style = styles.td_max_supply;
                break;

            case 'last_updated':
                style = styles.td_last_updated;
                break;

            case 'price':
                style = styles.td_price;
                break;

            case 'volume_24h':
                style = styles.td_volume_24h;
                break;

            case 'market_cap':
                style = styles.td_market_cap;
                break;

            case 'percent_change_1h':
                style = styles.td_percent_change_1h;
                break;

            case 'percent_change_24h':
                style = styles.td_percent_change_24h;
                break;

            case 'percent_change_7d':
                style = styles.td_percent_change_7d;
                break;

            default:
                break;
        }

        return style;
    }
}

const styles = StyleSheet.create({
    _container: {
        backgroundColor: '#F5FCFF',
        flex: 1,
        // flexDirection: 'row',
        // overflow: 'hidden'
    },
    _table: {
        // display: 'flex',
        flex: 1,
        flexDirection: 'row',
        // alignItems: 'center',

        overflow: 'scroll'
    },
    _tr: {
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        flex: 1,
        // justifyContent: 'center',
        flexDirection: 'row',
        fontSize: 20,
        // textAlign: 'center',
        // margin: 10
    },
    _td: {
        borderRightColor: '#000',
        borderRightWidth: 1,
        // flex: 1,
        padding: 5,
        textAlign: 'left'
    },
    _td_text: {
        color: '#000',
        fontSize: 12
    },
    td_id: {
        width: 40,
    },
    td_name: {
        width: 150
    },
    td_symbol: {
        width: 50
    },
    td_rank: {
        width: 40
    },
    td_circulating_supply: {
        width: 110
    },
    td_total_supply: {
        width: 110
    },
    td_max_supply: {
        width: 110
    },
    td_last_updated: {
        width: 70
    },
    td_price: {
        width: 110
    },
    td_volume_24h: {
        width: 150
    },
    td_market_cap: {
        width: 130
    },
    td_percent_change_1h: {
        width: 60
    },
    td_percent_change_24h: {
        width: 60
    },
    td_percent_change_7d: {
        width: 60
    }
});
