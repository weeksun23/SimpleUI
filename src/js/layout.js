/*
simple-layout by weeksun23 2014-05-31
*/
(function($,undefined){
	"use strict";
	var SPLIT_WIDTH = 5;
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
		//boolean 是否能调整大小，只在split为true的情况下有用
		resize : true,
		//boolean[true->border-width:1px|false->border-width:0]
		//string[0 1 1 0->border-width:0px 1px 1px 0px]
		border : true,
		//string[0 1 2 3->padding:0px 1px 2px 3px]
		//number[0->padding:0px|5->padding:5px]
		padding : '0'
	};
	//boxwidth = width + padding + borderWidth
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
				var dealTpl = $.simple.dealTpl;
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
					bottom = 0,
					//split html template
					splitTpl = "<div class='layout-split layout-split-${cls}' data-region='${region}' style='${style}'></div>",
					//储存所有split的html数组
					splitHtml = [];
				//顺序 north,south -> east,west -> center
				$this.children("div[data-options]").each(function(){
					var $region = $(this);
					var regionOpts = getOptions(defaultRegionOptions,$region,{});
					var region = regionOpts.region;
					var split = regionOpts.split;
					//处理border padding
					var boxInfo = dealBox(regionOpts.border,regionOpts.padding);
					var cssObj = boxInfo.css;
					var style;
					$region.addClass("layout-item simple-border layout-" + region);
					if(region === 'center'){
						//缓存center，最后处理
						$center = $region;
						centerCssObj = cssObj;
						return;
					}else if(region === 'west' || region === 'east'){
						//先缓存west east，待处理完north south后再处理
						var w = getSize($region,cssObj,boxInfo,regionOpts.width,'width');
						if(region === 'west'){
							left = split ? w + SPLIT_WIDTH : w;
						}else{
							right = split ? w + SPLIT_WIDTH : w;
						}
						regionsCssObj[region] = cssObj;
						regions[region] = {
							target : $region,
							split : split
						};
						return;
					}
					var h = getSize($region,cssObj,boxInfo,regionOpts.height,'height');
					if(region === 'north'){
						if(split){
							style = "top:" + h + "px";
							top = h + SPLIT_WIDTH;
						}else{
							top = h;
						}
					}else{
						if(split){
							style = "bottom:" + h + "px";
							bottom = h + SPLIT_WIDTH;
						}else{
							bottom = h;
						}
					}
					split && splitHtml.push(dealTpl(splitTpl,{
						cls : "northsouth",
						region : region,
						style : style
					}));
					$region.css(cssObj);
				});
				for(var i in regions){
					var cssObj = regionsCssObj[i];
					var item = regions[i];
					cssObj.top = top;
					cssObj.bottom = bottom;
					item.target.css(cssObj);
					if(item.split){
						var str = "top:" + top + "px;bottom:" + bottom + "px";
						splitHtml.push(dealTpl(splitTpl,{
							cls : 'eastwest',
							region : i,
							style : i === 'west' ? "left:" + (left - 5) + "px;" + str 
								: "right:" + (right - 5) + "px;" + str
						}));
					}
				}
				centerCssObj.top = top;
				centerCssObj.left = left;
				centerCssObj.bottom = bottom;
				centerCssObj.right = right;
				$center.css(centerCssObj);
				if(splitHtml.length > 0){
					$this.append(splitHtml.join(""));
				}
			}
		});
		return result;
	};
	layout.defaultOptions = defaultOptions;
	layout.defaultRegionOptions = defaultRegionOptions;
	layout.methods = methods;
})($);