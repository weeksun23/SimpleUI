/*
	simple-layout : 1.0
*/
(function($,undefined){
	"use strict";
	var defaultOptions = {
		//boolean[true:宽高为100%，对body标签无效|false:指定width height]
		fit : true
		/*
		//number layout高度，只在fit为false的情况下有效
		height : undefined,
		//number 同height
		width : undefined,
		//number 最小高度，只在fit为true的情况下有效
		minHeight : undefined,
		//number 最小宽度，同minHeight
		minWidth : undefined
		*/
	};
	var methods = {

	};
	var defaultRegionOptions = {
		/*
		//string[north|west|south|east|center] 区域的位置
		region : undefined,
		//number 区域的高度，只对north south有效
		height : undefined,
		//number 区域的宽度，只对west east有效
		width : undefined,
		*/
		//boolean 是否具有调整大小的5px间隙，只对非center的区域有效
		split : false,
		//boolean[true->border-width:1px|false->border-width:0]
		//string[0 1 1 0->border-width:0px 1px 1px 0px]
		border : true,
		//string[0 1 2 3->padding:0px 1px 2px 3px]
		//number[0->padding:0px|5->padding:5px]
		padding : '0'
	};
	//box width + padding + borderWidth
	function dealBox(border,padding){
		var borderCss,borderArr,paddingCss,paddingArr;
		if(!border){
			borderCss = '0';
			borderArr = ['0','0','0','0'];
		}else if(border === true){
			borderCss = '1px';
			borderArr = ['1','1','1','1'];
		}else{
			borderCss = border.replace(" ","px ") + 'px';
			borderArr = border.split(" ");
		}
		padding = String(padding);
		if(padding.length === 1){
			paddingCss = padding;
			paddingArr = [padding,padding,padding,padding];
		}else{
			paddingCss = padding.replace(" ","px ") + 'px';
			paddingArr = padding.split(" ");
		}
		var dW = 0,dH = 0;
		for(var i=0;i<4;i++){
			var padVal = Number(paddingArr[i]);
			if(i === 0 || i === 2){
				if(borderArr[i] === '1') dH++;
				dH += padVal;
			}else{
				if(borderArr[i] === '1') dW++;
				dW += padVal;
			}
		}
		return {
			width : dW,
			height : dH,
			css : {
				'border-width' : borderCss,
				'padding' : paddingCss
			}
		};
	}
	//设置cssObj，并获取box所占的实际宽度或高度
	function getSize($region,cssObj,boxInfo,size,key){
		if(size){
			cssObj[key] = size;
		}else{
			size = $region.width();
		}
		return size + boxInfo[key];
	}
	var layout = $.fn.layout = function(options){
		var outerArguments = arguments;
		var result = $(this).each(function(){
			if(typeof options === 'string'){
				var re = methods[options].apply(this,Array.prototype.slice.call(outerArguments,1));
				if(re !== undefined){
					result = re;
					return false;
				}
			}else{
				var $this = $(this);
				var getOptions = $.simple.getOptions;
				options = getOptions(defaultOptions,$this,options);
				if(this.tagName.toLowerCase() !== 'body'){
					//由于region区域都是绝对定位 所以父容器必须为相对定位或者是body标签
					$this.css('position','relative');
					if(options.fit){
						//自适应
						$this.addClass("layout-fit");
						//最少宽度 最少高度
						$this.css($.simple.getPartOfObj(options,['minWidth','minHeight']));
					}else{
						//非自适应
						$this.css($.simple.getPartOfObj(options,['width','height']));
					}
				}
				var //缓存west east
					regions = {},
					//缓存west east的css对象
					regionsCssObj = {},
					//缓存center
					$center,
					//缓存center的css对象
					centerCssObj,
					//west center east的top值
					top = 0,
					//center的left值
					left = 0,
					//center的right值
					right = 0,
					//west center east的bottom值
					bottom = 0;
				$this.children("div[data-options]").each(function(){
					var $region = $(this);
					var regionOpts = getOptions(defaultRegionOptions,$region,{});
					var region = regionOpts.region;
					//处理border padding
					var boxInfo = dealBox(regionOpts.border,regionOpts.padding);
					var cssObj = boxInfo.css;
					$region.addClass("layout-item simple-border layout-" + region);
					if(region === 'center'){
						$center = $region;
						centerCssObj = cssObj;
						return;
					}else if(region === 'west' || region === 'east'){
						var w = getSize($region,cssObj,boxInfo,regionOpts.width,'width');
						if(region === 'west'){
							left = w;
						}else{
							right = w;
						}
						regionsCssObj[region] = cssObj;
						regions[region] = $region;
						return;
					}
					var h = getSize($region,cssObj,boxInfo,regionOpts.height,'height');
					if(region === 'north'){
						top = h;
					}else{
						bottom = h;
					}
					$region.css(cssObj);
				});
				for(var i in regions){
					var cssObj = regionsCssObj[i];
					cssObj.top = top;
					cssObj.bottom = bottom;
					regions[i].css(cssObj);
				}
				centerCssObj.top = top;
				centerCssObj.left = left;
				centerCssObj.bottom = bottom;
				centerCssObj.right = right;
				$center.css(centerCssObj);
			}
		});
		return result;
	};
	layout.defaultOptions = defaultOptions;
	layout.defaultRegionOptions = defaultRegionOptions;
	layout.methods = methods;
})($);