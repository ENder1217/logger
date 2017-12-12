## logger
通用埋点采集器， 结构中埋点信息配置为
```
<div data-log-id="a" data-log-data='{"a":098}'>
  <div data-log-id="b" data-log-data='{"b":678}'>
    <div>
      <input type="button" value="添加" data-log-act="t" data-log-data='{"d":234}'/>
    </div>
  </div>
</div>
```
> 当按钮点击后会生成一条打点记录，打点标识为 a_b_t_click，对应的记录数据信息为 {"a":098,"b":678,"d":234}

这种埋点方式的好处主要有以下几点：
- 业务方不需要关心埋点的逻辑，只需要在需要的节点进行配置
- 组件化的开发可以在组件池里配置埋点的信息，这样每个通用组件的埋点id是固定的，后端服务器可以统一处理
- 不同的业务线只需要在页面入口文件的body上配置不同的id就可以相互区分
