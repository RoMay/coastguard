
		var values = { // static values used as a predefined configuration 
			zodControllArea: [0, 0],
			horizont: view.bounds.height/3,
			skyGradient: new Gradient(["#729FCF", "#97E1FC"]),
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
				var step = 10;
				
				if(direction == "left")
					obj.position.x -= step;
				if(direction == "right")
					obj.position.x += step;
				
			}
	
		};
		
		
		
		
		
		var sky, zod, zodGround, baza, bazaGround, islandGround;
		
		var clouds = [], balloons = [], ships = [], zodArea = [], bazaArea = [];//, zodControllArea = [0, 0]; 
		
		//var values.horizont = view.bounds.height/3 
		
		//sky = new Path.Rectangle(0, [view.bounds.width, values.horizont])
		
		var Sky = {
			background: function(gradientColor){
				skyGradientColor = gradientColor || new GradientColor(values.skyGradient, [0, 0], [0, 300])
				var sky = new Path.Rectangle(0, [view.bounds.width, values.horizont])
				sky.fillColor = skyGradientColor; 
			
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
			
			},
			
			init: function(){
				/*
				var center = new Point(100, 100);
				var sides = 3;
				var radius = 50;
				var triangle = new Path.RegularPolygon(center, sides, radius);
				triangle.fillColor = 'black';
				*/
				
				var segments = [new Point(100, 100), new Point(30, 200), new Point(100, 300)];
				var path = new Path(segments);
				path.closed = true;
				path.fillColor = 'black';
				//path.position = {y: values.horizont+60, x: 175}
				
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
				
				return inst;
				
				//zodGroup.addChild(zodI)
				//zodAreaGroup.addChild(zodGroup)
			}
			
			
		}
		

		var shipsGroup = new Group();
		//ships.clipMask = false;
		
		var zodAreaGroup = new Group();
		zodAreaGroup.clipMask = false;
		
		var zodGroup = new Group();
		zodGroup.clipMask = false;
		

		function drawShot(){
			
		}
		
		
		var Scene = new function(){
			
			return {
				init: function(){
					Sky.background();
					Sky.clouds();
					Sky.balloons();
					Baza.ground();
					Baza.tower();
					Zod.ground();
					Zod.gun();
					
					
					$(objects.ships).each(function(){
						Methods.toRasterSymbol($(this).attr("id"), ships)
						
						
					})
						
					
					
					
					
					Island.init()
					
					Flag.init();
					
					var shipsNumber = 20
					var sDist = view.bounds.width/2
					Methods.toMultiplyObjects(ships, shipsNumber, shipsGroup, sDist, [0.05, 0.05]);
				
					/*
					$(shipsGroup.children).each(function(i){
						
						Methods.toReflectObject(shipsGroup.children[i])
						
					})
					*/
					
					shipsGroup.position.x += view.bounds.width
					shipsGroup.position.y = values.horizont+100
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
		/*
			$(group.children).each(function(i){
					group.children[i].rotate(i+1)
			})
		*/	
			
			cloudsGroup.position.x -=  0.2;
			
			balloonsGroup.position.x -=  0.15;
			
			shipsGroup.position.x -= 2
			/*
			$(shipsGroup.children).each(function(i){
					shipsGroup.children[i].rotate(i)
			})
			*/
			
			
			
			
			
		}
		
		function onKeyDown(event) {
			if (event.key == 'space') {
				//layer.selected = !layer.selected;
				
				drawShot()
				
				console.log("space")
				
				return false;
			}
			
			if (event.key == "left" || event.key == "right") {
				
				//if(zodGroundI<)
				
				
				//Methods.moveObjectOnLine(zodGroup, event.key)
				
				return false;
			}
			
		}
		
		function onKeyUp(event) {
			if (event.key == 'space') {
				//layer.selected = !layer.selected;
				
				drawShot()
				
				console.log("space")
				
				return false;
			}
			
			if (event.key == "left") {
				
				console.log("leftUP")
				
				return false;
			}
			
			if (event.key == "right") {
				
				console.log("right")
				
				return false;
			}
		}
		
		