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
	last_image:null,
	url_segs:[],
	//
	url_analyser:function(url){
		this.url_segs.length = 0;
		//http://fs2ew.redirectme.net/girl/67/01.jpg
		var segs = url.split(/(\/){1}/);
		var length = segs.length;
		for(var i=0;i<length-1;i++){
			
			if(isNaN(this.toInt(segs[i]))){
				this.url_segs.push(segs[i]);
			}else{
				this.url_segs.push(this.toInt(segs[i]));
			}
		}
		//image
		var image_name = segs[length-1].split(/(\.){1}/);
		for(var j=0;j<image_name.length;j++){
			if(isNaN(this.toInt(image_name[j]))){
				this.url_segs.push(image_name[j]);
			}else{
				this.url_segs.push(this.toInt(image_name[j]));
			}
		}
		
	},
	show_url:function(div){
		var frag = document.createDocumentFragment();
		for(var i=0;i<this.url_segs.length;i++){
			var control ;
			if(typeof this.url_segs[i] == "string"){
				control = document.createElement("label");
				control.innerHTML = this.url_segs[i];
			}else{
				control = document.createElement("input");
				control.value = this.url_segs[i];
			}
			frag.appendChild(control);
		}
		this.id(div).appendChild(frag);
	},
	locate_index_pointer:function(){
		var last_position;
		if(this.index_pointer == -1){
			last_position = this.url_segs.length;
		}else{
			last_position = this.index_pointer;
		}
		for(var i=last_position-1;i>=0;i--){
			if(!isNaN(this.toInt(this.url_segs[i]))){
				this.index_pointer = i;
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
		if(walker2<10){
			walker = "0"+ walker2;	
		}else{
			walker = walker2;
		}
		this.url_segs[this.index_pointer] = walker;
		
		/*This is wired.If don't do this assignment,
		 * container in function of justify_gallery is undefined.
		 */
		var container = container;
		var monitor = monitor;
		var image = new Image();
		var justify_gallery = function(){
			var width = this.toInt(this.id(container).offsetWidth)+image.width+5;//5 fix gap
			this.id(container).style.width = width +"px";
		}.bind(this,image);
		//
		image.className = "sample-image";
		image.onload =  function(){
			this.id(monitor).innerHTML = "Image has loaded ";
			justify_gallery();
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
		if(this.last_image == null){
			this.id(container).appendChild(image);
		}else{
			this.id(container).insertBefore(image,this.last_image);
		}
		//
		this.last_image = image;
	}
}


