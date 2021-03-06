Function.prototype.bind = function(){
	var options = {bind: arguments[0], args: Array.slice(arguments,1)}
	var self = this;
	return function(event){
		var returns = function(){
			return self.apply(options.bind || null, options.args);
		};
		return returns();
	};
};
Node.prototype.removeAllChildren = function(){
	for(var i=this.children.length-1;i>=0;i--){
		this.removeChild(this.children[i]);
	}
};


var IC = {
	id:	function(id){
		return document.getElementById(id);
	},
	toInt:function(value){
		var result = parseInt(value,10);
		if(isNaN(result)){
			var tmp = /(\d)+?$/.exec(value);
			if(tmp){
				result = parseInt(tmp[0],10);
			}
		}
		return result;
	},
	//
	image_broken:false,
	continuous_broken:false,
	index_pointer:-1,
	last_position:-1,
	number_rollen:[],
	last_image:null,
	url_segs:[],
	//
	reset:function(){
		this.url_segs.length = 0;
		this.image_broken = false;
		this.continuous_broken = false;
		this.index_pointer = -1;
		this.last_position = -1,
		this.number_rollen.length = 0;
	},
	url_analyser:function(url){
		this.reset();
		//http://fs2ew.redirectme.net/girl/67/01.jpg
		var segs = url.split(/(\/){1}/);
		this.url_segs = segs;
		//image
		var length = segs.length;
		var image_name = segs[length-1].split(/(\.){1}/); 
		this.url_segs[length-1] = image_name[0];
		this.url_segs.push(image_name[1]);
		this.url_segs.push(image_name[2]);
		
		for(var i=0;i<length;i++){
			if(/(\d)+?$/.test(segs[i])){
				this.number_rollen[i] = true;
			}
		}
		this.index_pointer = this.number_rollen.length-1;
		this.last_position = this.index_pointer;
		
	},
	show_url:function(div){
		var frag = document.createDocumentFragment();
		for(var i=0;i<this.url_segs.length;i++){
			var control ;
			if(this.number_rollen[i]){
				control = document.createElement("input");
				control.value = this.url_segs[i];
			}else{
				control = document.createElement("label");
				control.innerHTML = this.url_segs[i];
			}
			frag.appendChild(control);
		}
		this.id(div).appendChild(frag);
	},
	locate_last_position:function(){
		for(var i=this.index_pointer;i>=this.last_position;i--){
			/*把以前参与计数的都清零*/
			if(this.number_rollen[i]){
				var pad = this.url_segs[i].length;
				this.url_segs[i] = "";
				//如果前导为0，则补充
				while(pad){
					this.url_segs[i] +="0";
					pad--;
				}
			}
		}
		
		for(var i=this.last_position-1;i>=0;i--){
			if(this.number_rollen[i]){
				
				var walker = this.url_segs[i];
				walker = this.next_Number(walker);
				this.url_segs[i] =  walker;
				/* What a pity! i already don't understand why i slice it.
				 * this.url_segs[i] =  walker.slice(0,-1*walker2.toString())+walker2;
				*/
				this.last_position = i;
				break;
			}
		}
	},
	increase_last_position:function(){
		for(var i=this.index_pointer;i>this.last_position;i--){
			var pad = this.url_segs[i].length;
			this.url_segs[i] = "";
			while(pad){
				this.url_segs[i] +="0";
				pad--;
			}
		}
		
		var walker = this.url_segs[this.last_position];
		walker = this.next_Number(walker);
		this.url_segs[this.last_position] =  walker;
	},
	next_url:function(container,monitor){
		if(this.continuous_broken){
			this.locate_last_position();
		}else if(this.image_broken){
			this.increase_last_position();
		}
		
		var walker =  this.url_segs[this.index_pointer];
		walker = this.next_Number(walker);
	
		this.url_segs[this.index_pointer] = walker;
		
		/*This is wired.If don't do this assignment,
		 * container in function of image.onload is undefined.
		 */
		var container = container;
		var monitor = monitor;
		//
		var image = new Image();
		image.className = "sample-image";
		image.onload =  function(){
			this.id(monitor).innerHTML = "Image has loaded ";
			//
			var width = this.toInt(this.id(container).offsetWidth)+image.width+5;//5 fix gap
			this.id(container).style.width = width +"px";
			//
			if(this.last_image == null){
				this.id(container).appendChild(image);
			}else{
				this.id(container).insertBefore(image,this.last_image);
			}
			//
			this.last_image = image;
			//
			this.continuous_broken = false;
			this.image_broken = false;
		}.bind(this);
		image.onabort = function(){
			this.id(monitor).innerHTML = "Loading is aborted ";
		}.bind(this);
		image.onerror = function(){
			this.id(monitor).innerHTML = "Image is not found, and url will change backward ";
			if(this.image_broken){
				//如果连续链接断，则移动滑标
				this.continuous_broken = true;
			}
			this.image_broken = true;
		}.bind(this);
		
		image.src = this.url_segs.join("");
		this.id(monitor).innerHTML = "Image is loading ,please wait ";
		
	},
	next_Number:function(walker){
		var walker2 = this.toInt(walker);
		walker2++;
		
		var pad_length = walker.length-walker2.toString().length;
		/*Regarding this fact;we trim 10000's first number to 0000, 
		 * and then convert to string '0000';
		 * */
		if(pad_length){
			walker = Math.pow(10,pad_length).toString().slice(1);
		}else{//skip case of pad_length = 0;
			walker = "";
		}
		
		return walker + walker2;
	}
}


