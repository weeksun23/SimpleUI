(function($){
	'use strict';
	function parseOptions(options){
		if (options && typeof options == 'string'){
			var first = options.substring(0,1);
			var last = options.substring(options.length-1,1);
			if (first !== '{') options = '{' + options;
			if (last !== '}') options = options + '}';
			return (new Function('return ' + options))();
		}
		return {};
	}
	$.simple = {
		//defaultOpts htmlOpts jsOpts
		getOptions : function(defaultOpts,$this,jsOpts){
			var copyOpts = $.extend(defaultOpts,{});
			return $.extend(copyOpts,parseOptions($this.attr("data-options")),jsOpts);
		},
		getOptionsNotDefault : function($this,jsOpts){
			return $.extend(parseOptions($this.attr("data-options")),jsOpts);
		},
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
		}
	};
})(jQuery);