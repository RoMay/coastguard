		var values = { // static values used as a predefined configuration 
			zodControllArea: [0, 0],
			horizont: view.bounds.height/3,
			skyGradient: new Gradient(["#729FCF", "#97E1FC"]),
			seeGradient: new Gradient(["#91cde0", "#4a8bcc"]),
			cloudsGroup: false,
			balloonsGroup: false
			
		};
		
		var objects = { // collector of static images specified from the markup
			clouds: $("img.clouds"),
			balloons: $("img.balloons"),
			zodArea: $("img.zod-area"),
			zod:$("img#zod")[0],
			zodGround:$("img#zod-ground")[0],
			baza:$("img#baza-tower")[0],
			bazaGround:$("img#baza-ground")[0],
			islandGround:$("img#island-ground")[0],
			ships: $("img.ships")
			
		};
		
		var Methods = { // shared help methods 
			toRasterSymbol: function (obj, returns){
			
				var raster = new Raster(obj);
				var symbol = new Symbol(raster);
				if(returns){
					returns.push(symbol.clone());
					raster.remove();
					return returns;
					
				}	
				else
					return symbol;
			},
			
			toPutInstance: function(obj, scale, position){
				var inst = obj.place();
				if(scale)
				inst.scale(scale[0], scale[1]);
				inst.position = position;
				
				
				return inst;
				
			},
			
			toReflectObject: function (obj, opacity, distance, scaleY, returns){
				var reflection = obj.clone()
				
				reflection.position.y += reflection.bounds.height+ (distance ? distance : 1)
				reflection.matrix.scaleY = "-"+reflection.matrix.scaleY* (scaleY ? scaleY : 1)
				reflection.opacity = opacity ? opacity : 0.15;
				
				//reflection.transform(new Matrix(reflection.matrix))
				
				if(returns){
				
					return returns;
					
				}	
				else
					return reflection;
			},
			
			toMultiplyObjects: function (objects, amount, group, distance, scale){
				var objectsAmount = objects.length
				
				for (var j = 0; j < amount; j++) {
					var style = Math.floor(Math.random() * objectsAmount);
					var instance = objects[style].place();
					instance.position =  new Point(distance * j+1 + Math.random() * 300, 30 + Math.random() * 100);
					instance.scale(scale[0], scale[1]);
					group.addChild(instance);
					
				}
				
			},
			
			moveObjectOnLine: function (obj, direction){
				var step = 1;
				
				if(direction == "left")
					obj.position.x -= step;
				if(direction == "right")
					obj.position.x += step;
				
			}
	
		};
		
		
		var sky, see, zod, zodGround, baza, bazaGround, islandGround;
		
		var clouds = [], balloons = [], ships = [], zodArea = [], bazaArea = [];//, zodControllArea = [0, 0]; 
		
		
		var Background = {
			sky: function(skyColor){
				skyGradientColor = skyColor || new GradientColor(values.skyGradient, [0, 0], [0, 300])
				
				sky = new Path.Rectangle(0, [view.bounds.width, values.horizont])
				sky.fillColor = skyGradientColor;
				
			},
			
			see: function(seeColor){
				seeGradientColor = seeColor || new GradientColor(values.seeGradient, [0, 100], [0, 700])
				
				see = new Path.Rectangle([0, values.horizont], [view.bounds.width, view.bounds.height])
				see.fillColor = seeGradientColor;
				
				if(!values.seeGroup){
						seeGroup = new Group();
						seeGroup.clipMask = false;
						
						values.seeGroup = true;
				}	

			},
			
			clouds: function(limit){
					
					var cloudsNumber = limit || 15;
					var cDist = view.bounds.width / cloudsNumber;
					
					$(objects.clouds).each(function(){
						Methods.toRasterSymbol($(this).attr("id"), clouds);
					
					})
					
					if(!values.cloudsGroup){
						cloudsGroup = new Group();
						cloudsGroup.clipMask = false;
						
						values.cloudsGroup = true;
					}	
					
					
					Methods.toMultiplyObjects(clouds, cloudsNumber, cloudsGroup, cDist, [0.6, 0.6]);
			},
			
			balloons: function(limit){
					
					var balloonsNumber = limit || 5;
						
					var bDist = balloonsNumber*view.bounds.width
					
					
					$(objects.balloons).each(function(){
						Methods.toRasterSymbol($(this).attr("id"), balloons);
					
					})
					
					if(!values.balloonsGroup){
						balloonsGroup = new Group();
						balloonsGroup.clipMask = false;
						
						values.balloonsGroup = true;
					}	
							
					Methods.toMultiplyObjects(balloons, balloonsNumber, balloonsGroup, bDist/10, [0.6, 0.6]);
			
			}
			
		
		};
		
		var Island = {
			defaults: {
				obj: $(objects.islandGround).attr("id"),
				objScale: [0.3, 0.2],
				objPosition: {x: view.bounds.width-300, y: values.horizont*2}
			},
			
			ground: function(object, scale, position){
				var object = object || this.defaults.obj;
				var scale = scale || this.defaults.objScale;
				var position = position || this.defaults.objPosition;
				
				ground = Methods.toRasterSymbol(object);
				
				var groundI = Methods.toPutInstance(ground, scale, position);
				return groundI;
				
			},
			
			reflect: function(obj){
				Methods.toReflectObject(obj, 0.19, -2, 0.7);
				
				return obj;
			},
			
			init: function(){
				var inst = this.ground();
				this.reflect(inst);
				
				return inst;
			}
		};
		
		var Flag = {
			defaults: {
				segments: [new Point(100, 100), new Point(30, 200), new Point(100, 300)],
				scale_x_max: 1,
				scale_x_min: 0.5,
				scale_x_amount: 5
			},
			
			scaling: function(obj, last_scale_x){
				var x = last_scale_x || this.defaults.scale_x_max;

				if(x>this.defaults.scale_x_min && x<this.defaults.scale_x_max) 
					x -= 0.1
				else
					x+= 0.1
				obj.scale([x, 1]);
/*				
				var decr = -1
				var count = 5
				var i = 0


				function scale(){

					return 0.1*i;
				//return decr;
				} 


				if(i==count){
					decr = decr>0 ? -1 : 1    
					i--
					scale();
				}
				else{
					i = decr>0 ? i-1 : i+1
					if(i == 0 && decr>0){
					decr = -1
					i+1
				}
					scale();
				}
				
	*/			
				return x;
			},
			
			init: function(){
				var segments = this.defaults.segments;
				var path = new Path(segments);
				path.closed = true;
				path.fillColor = 'black';
				path.position = {y: values.horizont+60, x: 1075}
				
				return path;
				
			}
			
		}
		
		var Baza = {
			defaults: {
				flagColor: 0,
				flagPath: 0,
				flagPosition:0
			},
			
			ground: function(object, scale, position){
				
				var object = object || $(objects.bazaGround).attr("id");
				var scale = scale || [0.3, 0.2];
				var position = position || {y: values.horizont+60, x: 75};
				
				var inst = Island.ground(object, scale, position);
				Island.reflect(inst);
				
			},
			
			tower: function(object, scale, position){
				var object = object || Methods.toRasterSymbol($(objects.baza).attr("id"));
				var scale = scale || [0.15, 0.15];
				var position = position || {y: values.horizont, x: 80};
				
				var inst = Methods.toPutInstance(object, scale, position);
				
				Methods.toReflectObject(inst, 0.1, 0, 0.7)

				//flag = Flag.init();
			},
			
			animate: function(){
				//flag.position.x -= 1
			},
			
			init: function(){
				
			}
		};
		
		var Zod = {
			defaults: {
				obj: Methods.toRasterSymbol($(objects.zod).attr("id")),
				objPosition: {y: view.bounds.height-30, x: view.center.x},
				objScale: [0.3, 0.4],
				ground: Methods.toRasterSymbol($(objects.zodGround).attr("id")),
				groundPosition: {y: view.bounds.height-22, x: view.center.x},
				groundScale: [1.1, 1.1], // try to make it with {x,y}
				controllArea: 0
			},
			
			values: { 
				moved_to: false
			},
			
			move_gun_to: function(){
					
					Methods.moveObjectOnLine(this.defaults.gun, this.values.moved_to);
			},
			
			ground: function(object, scale, position){
				
				var object = object || this.defaults.ground;
				var scale = scale || this.defaults.groundScale;
				var position =  position || this.defaults.groundPosition;
				var inst = Methods.toPutInstance(object, scale, position);

				this.defaults.controllArea = [inst.bounds.x, inst.bounds.x+view.bounds.width]
				
				return inst;
				
				//zodAreaGroup.addChild(zodGroundI)
				
			},
			
			gun: function(object, scale, position){
				var object = object || this.defaults.obj;
				var scale = scale || this.defaults.objScale;
				var position =  position || this.defaults.objPosition;
				var inst = Methods.toPutInstance(object, scale, position);

				this.defaults.gun = inst;

				return inst;
				
			}
			
			
		};
		



		function drawShot(){
			
		}
		
		var Scene = new function(){
			
			var staticElems = new Group();
			
			
			
			
			return {
				update: function(){
					cloudsGroup.position.x -=  0.2;
					balloonsGroup.position.x -=  0.15;
					shipsGroup.position.x -= 1
					
					if(Zod.values.moved_to) Zod.move_gun_to();
				
				},
				
				init: function(){
					Background.sky();
					Background.see();
					Background.clouds();
					Background.balloons();
					Baza.ground();
					Baza.tower();
					Zod.ground();
					Zod.gun();
					
					shipsGroup = new Group();
					//ships.clipMask = false;
					zodAreaGroup = new Group();
					zodAreaGroup.clipMask = false;
					
					zodGroup = new Group();
					zodGroup.clipMask = false;
			
					
					$(objects.ships).each(function(){
						Methods.toRasterSymbol($(this).attr("id"), ships)
						
						
					})
					
					
					Island.init();
					
					var shipsNumber = 20;
					var sDist = view.bounds.width/2;
					Methods.toMultiplyObjects(ships, shipsNumber, shipsGroup, sDist, [0.05, 0.05]);
				
					
					shipsGroup.position.x += view.bounds.width;
					shipsGroup.position.y = values.horizont;
				}
			}
			
		}
		
		Scene.init();
	
		function onMouseDrag(event) {
			//console.log('You dragged the mouse!');
		}

		function onMouseUp(event) {
			//console.log(project.activeLayer.lastChild);
		}
		
		
		
		function onFrame(event){
		
//			Baza.animate()
			
			Scene.update();
			
			
		}
		
		function onKeyDown(event) {
			if (event.key == 'space') {
				//layer.selected = !layer.selected;
				
				//drawShot()

				debug.toPrint("space");
						
				return false;
			};
			
			if (event.key == "right") {
				Zod.values.moved_to = "right";
				
				debug.toPrint(Zod.values.moved_to)
				return false;
			};
			
			if (event.key == "left") {
				Zod.values.moved_to = "left";
				
				debug.toPrint(Zod.values.moved_to)
				return false;
			};
				
				//return false;
			
		}
		
		function onKeyUp(event) {
			if (event.key == 'space') {
				
				
				drawShot()
				
				console.log("space")
				
				return false;
			}
			
			
			
			if (event.key == "left" || event.key == "right") 
				Zod.values.moved_to = false;
			
		}
		
		