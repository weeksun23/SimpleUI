(function($){
	'use strict';
	/*
	parse string options to object
	@param options string : 'a:1,b:1,c:function(){}'
	*/
	function parseOptions(options){
		if (typeof options == 'string'){
			return (new Function('return {' + options + '};'))();
		}
		return {};
	}
	/*
	公共命名空间，提供帮助方法
	*/
	$.base = {
		/*
		获取最终配置项
		@param defaultOpts object 组件默认配置项
		@param $this $object 组件的jquery对象，用于获取配置在html元素中的data-options配置项
		@param jsOpts object 通过JS传入的配置项 将会覆盖上述两项的同名属性
		*/
		getOptions : function(defaultOpts,$this,jsOpts){
			if(!defaultOpts){
				var copyOpts = {};
			}else{
				copyOpts = $.extend({},defaultOpts);
			}
			return $.extend(copyOpts,parseOptions($this.attr("data-options")),jsOpts);
		},
		/*
		获取指定对象中的部分属性组成新的对象返回
		@param obj object 指定对象
		@param attrArr array 要复制的属性名数组
		*/
		getPartOfObj : function(obj,attrArr){
			var result = {};
			for(var i=0,ii=attrArr.length;i<ii;i++){
				var item = attrArr[i];
				var val = obj[item];
				if(val !== undefined){
					result[item] = val;
				}
			}
			return result;
		},
		/*
		简单模板处理
		@param tpl string 模板字符串 : '<div class='${cls}' data-id='${id}'>${name}</div>'
		@param obj object 嵌入模板的对象 : {cls : 'test-cls',id : 1,name : 'test'}
		*/
		dealTpl : function(tpl,obj){
			for(var i in obj){
				var reg = new RegExp("\\$\\{" + i + "\\}","g");
				var val = obj[i];
				tpl = tpl.replace(reg,val);
			}
			return tpl;
		}
	};
})(jQuery);