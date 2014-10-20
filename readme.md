#模仿jquery easyui，致力于实现一个功能与其相当，性能更佳的UI库
###layout
>通过简单配置就能实现layout布局
>
    HTML:
    <div id='page' data-options='fit:true,minHeight:400,minWidth:400'>
        <div data-options="region:'north',height:40,padding:5"></div>
        <div data-options="region:'center'"></div>
        <div data-options="region:'west',width:200"></div>
        <div data-options="region:'east',width:200"></div>
        <div data-options="region:'south',height:50"></div>
    </div>
    JS:
    $('#page').layout();
当fit为true或者是body标签的情况下，其自适应父容器，不再通过JS来resize，并且支持各区域的border-width、padding设置
###btn
###menu
###menubutton
