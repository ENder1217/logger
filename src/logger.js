class Logger {
    delegate(node, type) {
        node.addEventListener(type, (event) => {
            let node = event.target || event.srcElement;

            this.log(node, type);
        }, !0);
    }

    /**
     * 解析埋点信息
     *
     * @param   {Element} node - DOM树节点
     * @returns {Object} 打点信息，e.g. {id:['a','b'], action:'d', data:{"a":098,"b":678,"d":234}}
     */
    parseLog(node) {
        let act = '',
            dat = {},
            path = [];

        let findAct = (node) => {
            act = (node.dataset || {})['logAct'];

            if (!!act) {
                mergeData(node);
            }
        }

        let findPath = (node) => {
            let id = (node.dataset || {})['logId'];

            if (!!id) {
                path.unshift(id);
                mergeData(node);
            }
        }

        let mergeData = (node) => {
            let str = (node.dataset || {})['logData'];

            if (!!str) {
                let data = JSON.parse(str);

                if (!!data) {
                    dat = util._$merge(data, dat);
                }
            }
        }

        while(node) {
            if (!act) {
                findAct(node);
            }else {
                findPath(node);
            }

            node = node.parentNode;
        }

        if (!!act) {
            return {
                id: path,
                data: dat,
                action: act
            }
        }
    }

    /**
     * 解析日志信息
     *
     * @param  {Object} data - 通过 parseLog 接口获取的日志信息
     * @param  {String} type - 日志类型
     * @return {Object} 日志结果, e.g. {actionId:'a_b_d_click',bizData:'{"a":098,"b":678,"d":234}'}
     */
    formatLog(data, type) {
        let ret = data.id || [];

        ret.push(data.action, type);

        return {
            bizData: data.data,
            actionId: ret.join('_')
        }
    }

    /**
     * 手动打点接口
     *
     * @param   {Element} node   - 代理节点
     * @param   {String}  type   - 事件类型名称
     * @returns {void}
     */
    log(node, type) {
        let ret = this.parseLog(node);

        if (!ret) {
            return;
        }

        ret = this.formatLog(
            ret, type || 'click'
            );

        if (!ret) {
            return;
        }

        this.log2server(ret);
    }

    /**
     * 记录打点信息
     *
     * @param   {Object} data          - 统计数据信息
     * @param   {String} data.actionId - 操作标识
     * @param   {String} data.bizData  - 操作相关数据，如果不是字符串则自动用JSON序列化
     * @returns {void}
     */
    log2server(data) {
        util._$cookie(LOG_CONFIG.COOKIE, {
            value: util.uuid(),
            path: '/'
        });

        let url = LOG_CONFIG.URL;

        url += url.indexOf('?') < 0 ? '?' : '&';

        let query = {
            p: LOG_CONFIG.PRODUCT,
            dt: data.bizData || {},
            csrfKey: util._$cookie(LOG_CONFIG.CSRF_COOKIE)
        }

        query.dt.action = data.actionId;

        query.dt = JSON.stringify(query.dt);

        url += util._$object2query(query);

        let img = new Image();

        img.src = url;
    }
}