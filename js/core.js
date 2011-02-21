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
		return parseInt(value,10);
	},
	//
	image_broken:true,
	index_pointer:-1,
	last_position:-1,
	number_rollen:[],
	last_image:null,
	url_segs:[],
	//
	url_analyser:function(url){
		this.url_segs.length = 0;
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
	locate_index_pointer:function(){
		for(var i=this.index_pointer;i>=this.last_position;i--){
			var pad = this.url_segs[i].length;
			this.url_segs[i] = "";
			while(pad){
				this.url_segs[i] +="0";
				pad--;
			}
		}
		
		for(var i=this.last_position-1;i>=0;i--){
			if(this.number_rollen[i]){
				
				var walker = this.toInt(this.url_segs[i]);
				walker++;
				this.url_segs[i] = walker;
				
				this.last_position = i;
				break;
			}
		}
	},
	next_url:function(container,monitor){
		if(this.image_broken){
			this.locate_index_pointer();
			this.image_broken = false;
		}
		
		var walker =  this.url_segs[this.index_pointer];
		var walker2 = this.toInt(walker);
		walker2++;
		
		var pad_length = walker.length-walker2.toString().length;
		while(pad_length){
			walker2 = "0"+ walker2;
			pad_length--;
		}
		walker = walker2;
	
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
			this.image_broken = false;
		}.bind(this);
		image.onabort = function(){
			this.id(monitor).innerHTML = "Loading is aborted ";
		}.bind(this);
		image.onerror = function(){
			this.id(monitor).innerHTML = "Image is not found, and url will change backward ";
			this.image_broken = true;
		}.bind(this);
		
		image.src = this.url_segs.join("");
		this.id(monitor).innerHTML = "Image is loading ,please wait ";
		
	}
}


