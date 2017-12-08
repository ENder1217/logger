# logger
通用埋点采集器， 结构中埋点信息配置为
```
<div data-log-id="a" data-log-data='{"a":098}'>
  <div data-log-id="b" data-log-data='{"b":678}'>
    <div>
      <input type="button" value="添加" data-log-act="d" data-log-data='{"d":234}'/>
    </div>
  </div>
</div>
```
当按钮点击后会生成一条打点记录，打点标识为 a_b_d_click，对应的记录数据信息为 {"a":098,"b":678,"d":234}
