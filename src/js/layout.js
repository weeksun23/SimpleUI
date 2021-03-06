/*
yuri-layout by weeksun23 2014-05-31
*/
(function($,undefined){
	"use strict";
	var SPLIT_WIDTH = 5;
	var REGION_MIN_WIDTH = 10;
	var REGION_MIN_HEIGHT = 10;
	var CENTER_MIN_HEIGHT = 10;
	var CENTER_MIN_WIDTH = 10;
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
		setSize : function(region,size,isAnimate){
			var $layout = $(this),
				$split = $layout.children("div.layout-split[data-region='"+region+"']");
			setRegionPos($split,$layout,region,size,getCssKeyByRegion(region),true);
			return $layout;
		}
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
	function getCssKeyByRegion(region){
		switch(region){
			case "north" : return 'top';
			case "south" : return 'bottom';
			case "west" : return 'left';
			case "east" : return 'right';
		}
	}
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
	//获取split能移动的距离的最大值
	function getMax($center,key,isHeight){
		var d,min;
		if(isHeight){
			d = $center.outerHeight();
			min = CENTER_MIN_HEIGHT;
		}else{
			d = $center.outerWidth();
			min = CENTER_MIN_WIDTH;
		}
		return parseInt($center.css(key),10) + d - min - SPLIT_WIDTH;
	}
	function doAnimate($this,obj,isAnimate){
		if(isAnimate){
			$this.animate(obj,400);
		}else{
			$this.css(obj);
		}
	}
	/*
	根据split定位region
	$split 要移动的split
	$layout layout区域
	region 要定位的region
	key string[left|right|top|bottom] 要改变值的css属性
	val 对应key要改变的css属性值,等于对应region的box所占width或height,即width+padding+borderWidth
	*/
	function setRegionPos($split,$layout,region,val,key,isAnimate){
		val = parseInt(val,10);
		var $div = $layout.children("div").filter(function(){
			var $this = $(this);
			return $this.hasClass("layout-item") || $this.hasClass("layout-split");
		});
		var obj = {};
		obj[key] = val;
		doAnimate($split,obj,isAnimate);
		switch(region){
			case "north":;
			case "south":
				$div.each(function(){
					var $this = $(this);
					if($this.hasClass("layout-" + region)){
						var paddingBorder = $this.outerHeight() - $this.height();
						var obj = {"height" : val - paddingBorder};
						doAnimate($this,{"height" : val - paddingBorder},isAnimate);
					}else if($this.hasClass("layout-west") || $this.hasClass("layout-center") ||
						//north south 要同时改变west center east以及他们之间的split的top或bottom值
						$this.hasClass("layout-east") || $this.hasClass("layout-split-eastwest")){
						var obj = {};
						obj[key] = val + SPLIT_WIDTH;
						doAnimate($this,obj,isAnimate);
					}
				});
				break;
			case "west":;
			case "east":
				$div.each(function(){
					var $this = $(this);
					if($this.hasClass("layout-" + region)){
						var paddingBorder = $this.outerWidth() - $this.width();
						doAnimate($this,{width : val - paddingBorder},isAnimate);
					}else if($this.hasClass("layout-center")){
						//west east 只需改变center的left或right值
						var obj = {};
						obj[key] = val + SPLIT_WIDTH;
						doAnimate($this,obj,isAnimate);
					}
				});
				break;
		}
	}
	//为split绑定移动resize事件
	function attachDragForSplit($splits,$layout){
		$splits.mousedown(function(downE){
			downE.preventDefault();
			var $split = $(this);
			var $clone = $split.clone().addClass("layout-split-clone").appendTo($layout);
			var region = $split.attr("data-region");
			var $target = $layout.children("div.layout-" + region);
			var moveKey = getCssKeyByRegion(region);
			switch(region){
				case "north":;
				case "south":
					var min = REGION_MIN_HEIGHT + $target.outerHeight() - $target.height();
					var isHeight = true;
					break;
				case "west":;
				case "east":
					min = REGION_MIN_WIDTH+ $target.outerWidth() - $target.width();
					isHeight = false;
					break;
			}
			var max = getMax($layout.children("div.layout-center"),moveKey,isHeight);
			var start = parseInt($clone.css(moveKey),10);
			$("<div class='layout-split-mask'></div>")
				.appendTo($layout)
				.on("mousemove.layoutSplit",function(e){
					var dLeft = e.pageX - downE.pageX;
					var dTop = e.pageY - downE.pageY;
					switch(region){
						case "north":var newVal = start + dTop;break;
						case "south":newVal = start - dTop;break;
						case "west":newVal = start + dLeft;break;
						case "east":newVal = start - dLeft;break;
					}
					if(newVal < min){
						newVal = min;
					}else if(newVal > max){
						newVal = max;
					}
					$clone.css(moveKey,newVal);
				}).on("mouseup.layoutSplit",function(){
					var val = $clone.css(moveKey);
					setRegionPos($split,$layout,region,val,moveKey);
					$clone.remove();
					$(this).remove();
				});
		});
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
				var getOptions = $.base.getOptions;
				var dealTpl = $.base.dealTpl;
				options = getOptions(defaultOptions,$this,options);
				if(this.tagName.toLowerCase() !== 'body'){
					//由于region区域都是绝对定位 所以父容器必须为相对定位或者是body标签
					$this.css('position','relative');
					if(options.fit){
						//自适应
						$this.addClass("layout-fit");
						//最少宽度 最少高度
						$this.css($.base.getPartOfObj(options,['minWidth','minHeight']));
					}else{
						//非自适应
						$this.css($.base.getPartOfObj(options,['width','height']));
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
					$region.addClass("layout-item ball layout-" + region);
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
					var $splitHtml = $(splitHtml.join(""));
					$this.append($splitHtml);
					attachDragForSplit($splitHtml,$this);
				}
			}
		});
		return result;
	};
	layout.defaultOptions = defaultOptions;
	layout.defaultRegionOptions = defaultRegionOptions;
	layout.methods = methods;
})($);