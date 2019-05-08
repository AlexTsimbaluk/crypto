import React, {Component} from 'react';
import {Platform, StyleSheet, ScrollView, Text, View} from 'react-native';

import axios from 'axios';


// отключаем варнинги
console.disableYellowBox = true;


const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
    android:
        'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
});

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
    }

    render() {
        return (
            <View style={styles._tr}>
                {
                    Object.keys(this.props.crypto)
                        .filter((elem, i) => this.props.crypto[elem] != null)
                        .map((elem, i) => (
                            <Value key={i} value={this.props.crypto[elem]} />
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

    render() {
        return (
            <View style={styles._td}>
                {
                    <Text>{this.props.value}</Text>
                }
            </View>
        );
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
        flex: 1,
        // justifyContent: 'center',
        flexDirection: 'row',
        fontSize: 20,
        // textAlign: 'center',
        margin: 10
    },
    _td: {
        flex: 1,
        paddingLeft: 5,
        paddingRight: 5,
        textAlign: 'center',
        color: '#333333'
    }
});
