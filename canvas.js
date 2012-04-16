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
			
			toReflectObject: function (obj, opacity, distance, scaleY, group){
				var reflection = obj.clone()
				
				reflection.position.y += reflection.bounds.height+ (distance ? distance : 1)
				reflection.matrix.scaleY = "-"+reflection.matrix.scaleY* (scaleY ? scaleY : 1)
				reflection.opacity = opacity ? opacity : 0.15;
				//reflection.fillColor = "red"
				
				if(group){
				
					return group.addChild(reflection);
					
				}	
				else
					return reflection;
			},
			
			toMultiplyObjects: function (objects, options){
				var objectsAmount = objects.length;
				var distance = options.distance || 0;
				
				var position_x = options.position_x || false;
				var position_y = options.position_y || false;
				
				
				/*
				var position = {
					x: function(index, random){
						return options.position.x || distance * index+1 + random;
					},
					y: function(index, random){
						return options.position.y || distance * index+1 + random;
					}
				}
				*/
				
				for (var j = 0; j < options.amount; j++) {
					if(objectsAmount>0){
						var style = Math.floor(Math.random() * objectsAmount);
						var instance = objects[style].place();
					}
					else{
						
						var instance = objects.place();
					}
					
					instance.position =  new Point(position_x ? position_x : ((distance * j+1) + (Math.random() * 100)), position_y ? position_y : (30 + Math.random() * 100));
					
					if(options.scale) instance.scale(options.scale[0], options.scale[1]);
					if(options.group){ 
				//		instance.name = "ship_";
						options.group.addChild(instance);
					}	
					
				}
				
				if(options.group) return options.group;
				
			},
			
			moveObjectOnLine: function (obj, direction, step){
				var step = step || 2;
				
				if(direction == "left")
					obj.position.x -= step;
				if(direction == "right")
					obj.position.x += step;
				
			}
	
		};
		
		
		var Game = new function(){
			var defaults = {
			  animal_ships: [
				{amount: 10, distance: view.bounds.width/7, position_y: values.horizont+40, scale: [0.5, 0.5], type: 1, speed: 2}, 
				{amount: 5, distance: view.bounds.width/5, position_y: values.horizont+20, scale: [0.2, 0.2], type: 2, speed: 1}
			  ]			  
			};
			
			return {
				current_level: defaults,
				reset_to_defaults: function(){
					this.current_level = defaults;
				}
			}
		}
		
		
		
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
					var cDist = view.bounds.width / cloudsNumber*2;
					
					$(objects.clouds).each(function(){
						Methods.toRasterSymbol($(this).attr("id"), clouds);
					
					})
					
					if(!values.cloudsGroup){
						cloudsGroup = new Group();
						cloudsGroup.clipMask = false;
						
						values.cloudsGroup = true;
					}	
					
					
					Methods.toMultiplyObjects(clouds, {amount: cloudsNumber, group: cloudsGroup, distance: cDist, scale: [0.6, 0.6]});
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
							
					Methods.toMultiplyObjects(balloons, {amount: balloonsNumber, group: balloonsGroup, distance: bDist/10, scale: [0.6, 0.6]});
			
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
		
		


		var Shot = {
			values: { 
				moved_to: 0
			},
			
			create: function(params){
				var topLeft = new Point(params.position.x-3, params.position.y);
				var size = new Size(6, 8);
				var rectangle = new Rectangle(topLeft, size);
				var path = new Path.Oval(rectangle);
				path.fillColor = '#ebebeb';
				path.opacity = .99
				
				
				var s = new Symbol(path);
				var instance = new PlacedSymbol(s);
				instance.position.x = params.position.x-5//, y: params.position.y};
				instance.position.y = params.position.y;
				instance.matrix.scaleY = "-"+instance.matrix.scaleY*1.3
				instance.fillColor = '#ebebeb';
				//console.log(instance);
				return instance;
			},
			
			remove: function(){
			
			}
			
		}
		
		
		var Zod = {
			defaults: {
				obj: Methods.toRasterSymbol($(objects.zod).attr("id")),
				objPosition: {y: view.bounds.height-140, x: view.center.x},
				objScale: [0.3, 0.4],
				ground: Methods.toRasterSymbol($(objects.zodGround).attr("id")),
				groundPosition: {y: view.bounds.height-122, x: view.center.x},
				groundScale: [1.1, 1.1], // try to make it with {x,y}
				controllArea: {}				
			},
			
			values: { 
				moved_to: false,
				hidden_shots: []
			},
			
			shotsGroups: [],
				
			move_gun_to: function(){
					
					if((Zod.values.moved_to == "left" && (Zod.defaults.gun.bounds.x < Zod.defaults.controllArea.min)) || (Zod.values.moved_to == "right" && (Zod.defaults.gun.bounds.x+Zod.defaults.gun.bounds.width > Zod.defaults.controllArea.max))){
						Zod.values.moved_to = false;
						return false;
					}
					
					Methods.moveObjectOnLine(this.defaults.gun, this.values.moved_to, 3);
					
			},
						
			move_shots_to: function(){
			
				$(Zod.shotsGroups).each(function(i, e){
					if(this.visible == false) return true;
					
					if(Zod.shotsGroups[i].position.y>values.horizont+5){
						Zod.shotsGroups[i].position.y -= 5*0.8;
						Zod.shotsGroups[i].scale(0.98);
						
						$(shipsGroup.children[0].children).each(function(ei, ee){
							if(shipsGroup.children[0].children[ei].handleBounds.intersects(Zod.shotsGroups[i].handleBounds)) {
								console.log("got it");
								
								//shipsGroup.children[0].children[ei].remove();
								shipsGroup.children[0].children[ei].visible = false;
								//shipsGroup.children[0].children[ei].opacity = 0
								
								Zod.shotsGroups[i].visible = false;
								//Zod.shotsGroups[i].remove();
								
								return true;
								/*
								$(Zod.values.hidden_shots).each(function(hi, he){
									//Zod.shotsGroups.splice(Zod.values.hidden_shots[he], 1);
								})
								*/
								//console.log(Zod.shotsGroups.length +" -- "+ Zod.values.hidden_shots);
								
								
							}
						});
						
					}
					else{
						this.visible = false;
						this.remove();
						//console.log(Zod.shotsGroups.length + " - " + Zod.values.hidden_shots.length + " - " + Shot.values.moved_to)
						//Zod.shotsGroups.splice(i)
						Zod.values.hidden_shots.push(i);
						//console.log(Zod.values.hidden_shots);
						return true;
						
					}
					
					
					
					
				});
			
				//Shot.values.moved_to--
			},
			
			fire_shot: function(){
				
				if(Zod.values.hidden_shots.length){
					$(Zod.values.hidden_shots).each(function(hi, he){
						Zod.shotsGroups.splice(Zod.values.hidden_shots[hi], 1);
					})
					Zod.values.hidden_shots.length = 0;
					//Shot.values.moved_to = 0;

				}
				
				this.shotsGroups.push(Shot.create({position: {x:Zod.defaults.gun.bounds.x+(Zod.defaults.gun.bounds.width/2), y:Zod.defaults.gun.bounds.y-100 }}));
				//Shot.values.moved_to +=1;
				
				
			},
	
			ground: function(object, scale, position){
				
				var object = object || this.defaults.ground;
				var scale = scale || this.defaults.groundScale;
				var position =  position || this.defaults.groundPosition;
				var inst = Methods.toPutInstance(object, scale, position);

				this.defaults.controllArea = {min: inst.bounds.x, max: inst.bounds.x+inst.bounds.width}
				reflection = Methods.toReflectObject(inst, 0.5, -10, 0.5)
				console.log(reflection.style)
				reflection.blendMode = 'lighten';
				return inst;
				
				//zodAreaGroup.addChild(zodGroundI)
				
			},
			
			gun: function(object, scale, position){
				var object = object || this.defaults.obj;
				var scale = scale || this.defaults.objScale;
				var position =  position || this.defaults.objPosition;
				var inst = Methods.toPutInstance(object, scale, position);

				this.defaults.gun = inst;				
				return this.defaults.gun;
				
			}
			
			
		};
		
		var Enemies = new function(){
		
			var ship = {
					styleA:{
						fillColor: '#ebebeb',
						strokeColor: '#999'
					},
					
					styleB:{
						fillColor: '#F2CEEB',
						strokeColor: '#333'
					},
					
					create: function(style){
						
						//var path = new Path([new Point(10, 30), new Point(-10, 15), new Point(20, 0), new Point(70, 30)]);
						var path = new Path([new Point(5, 30), new Point(-5, 20), new Point(20, 23), new Point(30, 10), new Point(45, 23), new Point(60, 23), new Point(50, 30)]);
						switch(style){
							case 1:
							path.style = this.styleA;
							break;
							case 2:
							path.style = this.styleB;						
							break;
						}
						
						return new Symbol(path);
						
					},
					
					remove: function(obj){
				
					}
					
					
			};
			
			return {
				shipsGroups: [],
				
				draw_ships: function(params){
					shipsGroup = new Group();
					
					$(params).each(function(i, e){
					  
					  Enemies.shipsGroups[i] = new Group();
					  
					  Methods.toMultiplyObjects(ship.create(e.type), {amount: e.amount, group: Enemies.shipsGroups[i], distance: e.distance, position_y:e.position_y, scale: e.scale});	
					 
   					  shipsGroup.addChild(Enemies.shipsGroups[i])


					  $(Enemies.shipsGroups[i].children).each(function(a){
						
							Methods.toReflectObject(Enemies.shipsGroups[i].children[a], 0.1, -1, 0.5, Enemies.shipsGroups[i])
							
						});
					  
					})
					shipsGroup.position.x += view.bounds.width;
					//console.log(Enemies.shipsGroups)
					
				},
				
				move_ships_to: function(){
				
					$(Enemies.shipsGroups).each(function(i, e){
						Enemies.shipsGroups[i].position.x -= Game.current_level.animal_ships[i].speed;
					});
					
				},
				
				init: function(){
						this.draw_ships(Game.current_level.animal_ships);
						
				}
			
			};
			
		
		};
		

		var Scene = new function(){
		
			return {
				update: function(){
					cloudsGroup.position.x -=  0.2;
					balloonsGroup.position.x -=  0.15;
					
					Enemies.move_ships_to();
					
					if(Zod.shotsGroups.length) Zod.move_shots_to();
					//console.log(Shot.values.moved_to);
					
					if(Zod.values.moved_to) Zod.move_gun_to();
				
				},
				
				init: function(){
					
					Background.sky();
					Background.see();
					Background.clouds();
					Background.balloons();
					//Background.clouds();
					Enemies.init();
					Baza.ground();
					Baza.tower();
					Zod.ground();
					//Zod.gun();
					
					
					//ships.clipMask = false;
					zodAreaGroup = new Group();
					zodAreaGroup.clipMask = false;
					
					zodGroup = new Group();
					zodGroup.clipMask = false;
			
					
					
					Island.init();
					
					
				}
			}
			
		}
		
		Scene.init();
		
		function onFrameUni(){
			
			Scene.update();
			
		}
		
		Scene.update();
	
		if(jQuery.browser.mozilla){
			function onFrameLoop(){ 
				
				window.setTimeout(function(){
			
			 
					Scene.update();
					view.draw();
					onFrameLoop();
					
				 }, 1);
				 
			}
			onFrameLoop();
		}
		else onFrame = onFrameUni;
		
		
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
				
				Zod.fire_shot()
				//console.log(Zod.shotsGroups.length)
			//	console.log(Zod.defaults.gun.bounds.x+(Zod.defaults.gun.bounds.width/2))
				
				return false;
			}
			
			
			
			if (event.key == "left" || event.key == "right") 
				Zod.values.moved_to = false;
			
		}
		
		
		function onMouseDrag(event) {
			//console.log('You dragged the mouse!');
		}

		function onMouseUp(event) {
			//console.log(project.activeLayer.lastChild);
		}
		
		
		