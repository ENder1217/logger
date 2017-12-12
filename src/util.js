let util = {};

let _isTypeOf = (_data, _type) => {
    _type = _type.toLowerCase();

    try {
        if (_data === null) {
            return _type == 'null';
        }

        if (_data === undefined) {
            return _type == 'undefined';
        }

        return Object.prototype.toString.call(_data).toLowerCase() == '[object ' + _type + ']';
    } catch (e) {
        return !1;
    }
}
util._$isFunction = (_data) => {
    return _isTypeOf(_data, 'function');
}

util._$isObject = (_data) => {
    return _isTypeOf(_data, 'object');
}

util._$isString = (_data) => {
    return _isTypeOf(_data, 'string');
}

util._$isArray = (_data) => {
    return _isTypeOf(_data, 'array');
}

util._$isNumber = (_data) => {
    return _isTypeOf(_data, 'number');
}

util._$isDate = (_data) => {
    return _isTypeOf(_data, 'date');
}

util._forIn = (_obj, _callback, _this) => {

    if (!_obj || !_callback) {
        return null;
    }

    let _keys = Object.keys(_obj);

    for (let i = 0, l = _keys.length, _key, _ret; i < l; i++){
        _key = _keys[i];
        _ret = _callback.call(
            _this || null,
            _obj[_key], _key, _obj
        );

        if (!!_ret) {
            return _key;
        }
    }

    return null;
}

util._$forEach = function (_list,_callback,_this) {

    if (!!_list && !!_list.length &&
        util._$isFunction(_callback)){
        if (!_list.forEach){
            util._$forIn.apply(util, arguments);
        }else{
            _list.forEach(_callback);
        }
    }
}

util._$loop = (_obj, _callback, _this) => {

    if (util._$isObject(_obj) &&
        util._$isFunction(_callback)) {
        return util._forIn(_obj, _callback, _this);
    }

    return null;
}

util._$forIn = (_list, _callback, _this) => {

    if (!_list || !util._$isFunction(_callback)) {
        return null;
    }

    if (util._$isNumber(_list.length)) {
        for (let i = 0, l = _list.length, _it; i < l; i++){
            _it = _list[i];
            if (_callback.call(_this || null, _it, i, _list)) {
                return i;
            }
        }
    }else if (util._$isObject(_list)) {
        return util._$loop(_list, _callback, _this);
    }

    return null;
}

util._$merge = function () {
    let _args = arguments,
        _last = _args.length - 1
        _filter = _args[_last],
        ret = null;

    if (util._$isFunction(_filter)) {
        _last--;
    }else {
        _filter = () => !1;
    }

    ret = _args[0] || {};

    for (let i = 1, _it; i <= _last; i++){
        _it = _args[i];

        util._$loop(_it, (v, k) => {
            if (!_filter(v, k)) {
                ret[k] = v;
            }
        })
    }

    return ret;
}

/**
 * 生成 UUID v4
 *
 * @returns {String} UUID
 */
util.uuid = () => {
    let d = +new Date();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};

/**
 * 设置或者获取cookie
 *
 * * 没有输入第二个参数则表示返回已有cookie
 * * 如果cookie值为空字符串则表示删除cookie
 *       // 设置cookie的name=abc
 *       var _cookie = util._$cookie('name','abc');
 *       util._$cookie('name',{value:'abc'});
 *
 *       // 设置路径，domain(如果domain不同域，cookie设置不会成功),设置过期时间1天;
 *       var _cookie = util._$cookie('name',{
 *           value:'abc',
 *           path:'/a/',
 *           domain:'www.163.com',
 *           expires:1
 *       });
 *
 *       // 删除cookie
 *       util._$cookie('name','');
 *       util._$cookie('name',{expires:-1});
 *
 * @method   module:util/cache/cookie._$cookie
 * @param    {String}        arg0    - cookie名称
 * @param    {String|Object} arg1    - cookie值，如果有其他配置信息输入对象，已处理属性包括
 * @return   {String}                - cookie值
 */
util._$cookie = (() => {
    let _date = new Date(),
        _crut = +_date,   // current time milliseconds
        _days = 86400000; // milliseconds of one day

    let _getcookie = (_name) => {
        let _cookie = document.cookie,
            _search = '\\b' + _name + '=',
            _index1 = _cookie.search(_search),
            _index2;

        if (_index1<0) {
            return '';
        }

        _index1 += _search.length-2;
        _index2 = _cookie.indexOf(';', _index1);

        if (_index2<0) {
            _index2 = _cookie.length;
        }

        return _cookie.substring(_index1, _index2) || '';
    };
    return (_name, _data) => {

        if (_data === undefined){
            return _getcookie(_name);
        }

        if (util._$isString(_data)){
            if (!!_data){
                document.cookie = _name + '=' + _data + ';';
                return _data;
            }
            _data = {expires:-100};
        }

        _data = _data || {};

        let _cookie = _name + '=' + (_data.value || '') + ';';

        delete _data.value;

        if (_data.expires !== undefined){
            _date.setTime(_crut + _data.expires * _days);
            _data.expires = _date.toGMTString();
        }
        _cookie += util._$object2string(_data,';');
        document.cookie = _cookie;
    };
})();

/**
 * key-value对象转成key=value对后用分隔符join
 *
 *
 *     // 返回字符串 abc=abc,123=123
 *     var obj = {
 *         abc:"abc",
 *         123:"123"
 *     };
 *     var str = _u._$object2string(obj);
 *
 *     // 返回字符串
 *     // a=1871406603152186&b=1,2,3&d={"a":"a","b":"b"}&e=e&f=1&g=true
 *     var obj = {
 *         a:new Date,
 *         b:[1,2,3],
 *         c:function(){},
 *         d:{a:'a',b:'b'},
 *         e:'e',
 *         f:1,
 *         g:true
 *     };
 *     var str = _u._$object2string(obj,'&');
 *
 * @param  {Object}  arg0           - 对象
 * @param  {String}  arg1           - 分隔符，默认为逗号
 * @param  {Boolean|Function} arg2  - 是否编码
 * @return {String}                 - key-value串
 */
util._$object2string = (_object, _split, _encode) => {

    if (!_object) {
        return '';
    }

    let _arr = [],
        _func = _encode;

    if (!util._$isFunction(_func)){
        _func = function(v){
            return !_encode ? v : encodeURIComponent(v);
        };
    }
    // parse object
    util._$loop(
        _object, (_value, _key) => {

            if (util._$isFunction(_value)){
                return;
            }

            if (util._$isDate(_value)){
                _value = _value.getTime();
            }else if(util._$isArray(_value)){
                _value = _value.join(',');
            }else if(util._$isObject(_value)){
                _value = JSON.stringify(_value);
            }

            _arr.push(_func(_key) + '=' + _func(_value));
        }
    );

    return _arr.join(_split || ',');
};

util._$object2query = (_obj) => {
    return util._$object2string(_obj, '&', !0);
}