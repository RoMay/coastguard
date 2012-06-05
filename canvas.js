		var values = { // static values used as a predefined configuration 
		    canvasHeight: $("#scene-canvas").height(),
			zodControllArea: [0, 0],
		    horizont: view.bounds.height / 3,
		    skyGradient: new Gradient(["#729FCF", "#97E1FC"]),
		    seeGradient: new Gradient(["#91cde0", "#4a8bcc"]),
		    cloudsGroup: false,
		    balloonsGroup: false

		};

		var objects = { // collector of static images specified from the markup
		    canvas_element: $("#scene-canvas"),
			clouds: $("img.clouds"),
		    balloons: $("img.balloons"),
		    zodArea: $("img.zod-area"),
		    zod: $("img#zod")[0],
		    zodGround: $("img#zod-ground")[0],
		    baza: $("img#baza-tower")[0],
		    bazaGround: $("img#baza-ground")[0],
		    islandGround: $("img#island-ground")[0],
		    ships: $("img.ships")

		};


		var Methods = { // shared help methods 
		    toRasterSymbol: function (obj, returns) {

		        var raster = new Raster(obj);
		        var symbol = new Symbol(raster);
		        if (returns) {
		            returns.push(symbol.clone());
		            raster.remove();
		            return returns;

		        } else return symbol;
		    },

		    toPutInstance: function (obj, scale, position) {
		        var inst = obj.place();
		        if (scale) inst.scale(scale[0], scale[1]);
		        inst.position = position;


		        return inst;

		    },

		    toReflectObject: function (obj, opacity, distance, scaleY, group) {
		        var reflection = obj.clone()

		        reflection.position.y += reflection.bounds.height + (distance ? distance : 1)
		        reflection.matrix.scaleY = "-" + reflection.matrix.scaleY * (scaleY ? scaleY : 1)
		        reflection.opacity = opacity ? opacity : 0.15;
		        //reflection.fillColor = "red"
		        if (group) {

		            return group.addChild(reflection);

		        } else return reflection;
		    },

		    toMultiplyObjects: function (objects, options) {
		        var objectsAmount = objects.length;
		        var distance = options.distance || 0;

		        var position_x = options.position_x || false;
		        var position_y = options.position_y || false;
		        for (var j = 0; j < options.amount; j++) {
		            if (objectsAmount > 0) {
		                var style = Math.floor(Math.random() * objectsAmount);
		                var instance = objects[style].place();
		            } else {

		                var instance = objects.place();
		            }

		            instance.position = new Point(position_x ? position_x : ((distance * j + 1) + (Math.random() * 100)), position_y ? position_y : (30 + Math.random() * 100));

		            if (options.scale) instance.scale(options.scale[0], options.scale[1]);
		            if (options.group) {
		                options.group.addChild(instance);
		            }

		        }

		        if (options.group) return options.group;

		    },

		    moveObjectOnLine: function (obj, direction, step) {
		        var step = step || 2;

		        if (direction == "left") obj.position.x -= step;
		        if (direction == "right") obj.position.x += step;

		    }

		};


		var sky, see, zod, zodGround, baza, bazaGround, islandGround;

		var clouds = [],
		    balloons = [],
		    ships = [],
		    zodArea = [],
		    bazaArea = []; //, zodControllArea = [0, 0]; 
		var Background = {
		    sky: function (skyColor) {
		        skyGradientColor = skyColor || new GradientColor(values.skyGradient, [0, 0], [0, 300])

		        sky = new Path.Rectangle(0, [view.bounds.width, values.horizont])
		        sky.fillColor = skyGradientColor;

		    },

		    see: function (seeColor) {
		        seeGradientColor = seeColor || new GradientColor(values.seeGradient, [0, 100], [0, 700])

		        see = new Path.Rectangle([0, values.horizont], [view.bounds.width, view.bounds.height])
		        see.fillColor = seeGradientColor;

		        if (!values.seeGroup) {
		            seeGroup = new Group();
		            seeGroup.clipMask = false;

		            values.seeGroup = true;
		        }

		    },

		    clouds: function (limit) {

		        var cloudsNumber = limit || 100;
		        var cDist = view.bounds.width / 4;

		        $(objects.clouds).each(function () {
		            Methods.toRasterSymbol($(this).attr("id"), clouds);

		        })

		        if (!values.cloudsGroup) {
		            cloudsGroup = new Group();
		            cloudsGroup.clipMask = false;

		            values.cloudsGroup = true;
		        }


		        Methods.toMultiplyObjects(clouds, {
		            amount: cloudsNumber,
		            group: cloudsGroup,
		            distance: cDist,
		            scale: [0.6, 0.6]
		        });
		    },

		    balloons: function (limit) {

		        var balloonsNumber = limit || 5;

		        var bDist = balloonsNumber * view.bounds.width


		        $(objects.balloons).each(function () {
		            Methods.toRasterSymbol($(this).attr("id"), balloons);

		        })

		        if (!values.balloonsGroup) {
		            balloonsGroup = new Group();
		            balloonsGroup.clipMask = false;

		            values.balloonsGroup = true;
		        }

		        Methods.toMultiplyObjects(balloons, {
		            amount: balloonsNumber,
		            group: balloonsGroup,
		            distance: bDist / 5,
		            scale: [0.5, 0.5]
		        });

		    }


		};

		var Island = {
		    defaults: {
		        obj: $(objects.islandGround).attr("id"),
		        objScale: [0.2, 0.1],
		        objPosition: {
		            x: view.bounds.width - 100,
		            y: values.horizont * 2
		        }
		    },

		    ground: function (object, scale, position) {
		        var object = object || this.defaults.obj;
		        var scale = scale || this.defaults.objScale;
		        var position = position || this.defaults.objPosition;

		        ground = Methods.toRasterSymbol(object);

		        var groundI = Methods.toPutInstance(ground, scale, position);
		        return groundI;

		    },

		    reflect: function (obj) {
		        Methods.toReflectObject(obj, 0.19, -2, 0.7);

		        return obj;
		    },

		    init: function () {
		        var inst = this.ground();
		        this.reflect(inst);

		        return inst;
		    }
		};
		
		var Baza = {
		    defaults: {
		        flagColor: 0,
		        flagPath: 0,
		        flagPosition: 0
		    },

		    ground: function (object, scale, position) {

		        var object = object || $(objects.bazaGround).attr("id");
		        var scale = scale || [0.3, 0.2];
		        var position = position || {
		            y: values.horizont + 60,
		            x: 75
		        };

		        var inst = Island.ground(object, scale, position);
		        Island.reflect(inst);

		    },

		    tower: function (object, scale, position) {
		        var object = object || Methods.toRasterSymbol($(objects.baza).attr("id"));
		        var scale = scale || [0.1, 0.1];
		        var position = position || {
		            y: values.horizont+20,
		            x: 80
		        };

		        var inst = Methods.toPutInstance(object, scale, position);

		        Methods.toReflectObject(inst, 0.1, 0, 0.7)

		    },

		    animate: function () {

		    },

		    init: function () {

		    }
		};




		var Shot = {
		    values: {
		        moved_to: 0
		    },

		    create: function (params) {
		        var topLeft = new Point(params.position.x - 3, params.position.y);
		        var size = new Size(6, 8);
		        var rectangle = new Rectangle(topLeft, size);
		        var path = new Path.Oval(rectangle);
		        path.fillColor = '#ebebeb';
		        path.opacity = .99


		        var s = new Symbol(path);
		        var instance = new PlacedSymbol(s);
		        instance.position.x = params.position.x - 5 //, y: params.position.y};
		        instance.position.y = params.position.y;
		        instance.matrix.scaleY = "-" + instance.matrix.scaleY * 1.3
		        instance.fillColor = '#ebebeb';
		        //console.log(instance);
		        return instance;
		    },

		    remove: function () {

		    }

		}


		var Zod = {
		    defaults: {
		        obj: Methods.toRasterSymbol($(objects.zod).attr("id")),
		        objPosition: {
		            y: view.bounds.height - 85,
		            x: view.center.x
		        },
		        objScale: [0.2, 0.2],
		        ground: Methods.toRasterSymbol($(objects.zodGround).attr("id")),
		        groundPosition: {
		            y: view.bounds.height -80,
		            x: view.center.x
		        },
		        groundScale: [1.1, 1.1],
		        // try to make it with {x,y}
		        controllArea: {}
		    },

		    values: {
		        moved_to: false,
		        hidden_shots: []                                              
		    },

		    shotsGroups: [],

		    move_gun_to: function () {

		        if ((Zod.values.moved_to == "left" && (Zod.defaults.gun.bounds.x < Zod.defaults.controllArea.min + 100)) || (Zod.values.moved_to == "right" && (Zod.defaults.gun.bounds.x + Zod.defaults.gun.bounds.width + 100 > Zod.defaults.controllArea.max))) {
		            Zod.values.moved_to = false;
		            return false;
		        }

		        Methods.moveObjectOnLine(this.defaults.gun, this.values.moved_to, 4);

		    },

		    move_shots_to: function () {

		        $(Zod.shotsGroups).each(function (i, e) {
		            if (this.visible == false) return true;

		            if (Zod.shotsGroups[i].position.y > values.horizont + 3) {
		                Zod.shotsGroups[i].position.y -= 5 * 0.8;
		                Zod.shotsGroups[i].scale(0.98);


		                $(Enemies.shipsGroups).each(function (gr) {
		                    $(Enemies.shipsGroups[gr].children).each(function (ei, ee) {
		                        if (Enemies.shipsGroups[gr].children[ei].handleBounds.intersects(Zod.shotsGroups[i].handleBounds)) {
		                           
									
		                            Enemies.shipsGroups[gr].children[ei].visible = false;
		                            Enemies.shipsReflectGroups[gr].children[ei].visible = false;
		                            							
		                            Zod.shotsGroups[i].visible = false;
		                            
									Game.values.score++;
									Status.toScore(Game.values.score);
									
									if(Game.values.score == Game.values.total_ships) Game.confirm_finish();
									
									return true;
		                            
		                        }
		                    });
		                });

		            } else {
		                this.visible = false;
		                this.remove();
		              
		                Zod.values.hidden_shots.push(i);
		              
		                return true;

		            }




		        });

		    },

		    fire_shot: function () {

		        if (Zod.values.hidden_shots.length) {
		            $(Zod.values.hidden_shots).each(function (hi, he) {
		                Zod.shotsGroups.splice(Zod.values.hidden_shots[hi], 1);
		            })
		            Zod.values.hidden_shots.length = 0;
		         
		        }

		        this.shotsGroups.push(Shot.create({
		            position: {
		                x: Zod.defaults.gun.bounds.x + (Zod.defaults.gun.bounds.width / 2),
		                y: Zod.defaults.gun.bounds.y - 100
		            }
		        }));
		        

		    },
			
			start_to_shot: function() {
				objects.canvas_element.animate({top: "-3px"}, 100, function(){
						$(this).animate({top: "0"}, 300, function(){
							
							Game.values.ready_to_shot = true;
						})
						view.zoom -=0.002;
						
						
					})
					Zod.fire_shot();
					view.zoom +=0.002;
					Game.values.ready_to_shot = false;		
			
			},

		    ground: function (object, scale, position) {

		        var object = object || this.defaults.ground;
		        var scale = scale || this.defaults.groundScale;
		        var position = position || this.defaults.groundPosition;
		        var inst = Methods.toPutInstance(object, scale, position);

		        this.defaults.controllArea = {
		            min: inst.bounds.x,
		            max: inst.bounds.x + inst.bounds.width
		        }
		        reflection = Methods.toReflectObject(inst, 0.5, -10, 0.5)
		        reflection.blendMode = 'lighten';
		        return inst;

		    },

		    gun: function (object, scale, position) {
		        var object = object || this.defaults.obj;
		        var scale = scale || this.defaults.objScale;
		        var position = position || this.defaults.objPosition;
		        var inst = Methods.toPutInstance(object, scale, position);

		        this.defaults.gun = inst;
		        return this.defaults.gun;

		    }


		};

		var Enemies = new function () {

		        var ship = {
		            styleA: {
		                fillColor: '#ebebeb',
		                strokeColor: '#999'
		            },

		            styleB: {
		                fillColor: '#F2CEEB',
		                strokeColor: '#666'
		            },

		            create: function (style) {

		                var path = new Path([new Point(5, 30), new Point(-5, 20), new Point(20, 23), new Point(30, 10), new Point(45, 23), new Point(60, 23), new Point(50, 30)]);
		                switch (style) {
		                case 1:
		                    path.style = this.styleA;
		                    break;
		                case 2:
		                    path.style = this.styleB;
		                    break;
		                }

		                return new Symbol(path);

		            },

		            remove: function (obj) {

		            }


		        };

		        return {
		            shipsGroups: [],

		            shipsReflectGroups: [],

		            draw_ships: function (params) {
		                shipsGroup = new Group();

		                $(params).each(function (i, e) {

		                    Enemies.shipsGroups[i] = new Group();

		                    Methods.toMultiplyObjects(ship.create(e.type), {
		                        amount: e.amount,
		                        group: Enemies.shipsGroups[i],
		                        distance: e.distance,
		                        position_y: e.position_y,
		                        scale: e.scale
		                    });

		                    shipsGroup.addChild(Enemies.shipsGroups[i])

		                    Enemies.shipsReflectGroups[i] = new Group();

		                    $(Enemies.shipsGroups[i].children).each(function (a) {

		                        Enemies.shipsReflectGroups[i].children[a] = Methods.toReflectObject(Enemies.shipsGroups[i].children[a], 0.1, -1, 0.5);

		                    });

		                    shipsGroup.addChild(Enemies.shipsReflectGroups[i])

		                })
		                shipsGroup.position.x += view.bounds.width;
		           
		            },

		            move_ships_to: function () {
					
		                $(Enemies.shipsGroups).each(function (i, e) {
		                    Enemies.shipsGroups[i].position.x -= Game.current_level.animal_ships[i].speed;
		                    Enemies.shipsReflectGroups[i].position.x -= Game.current_level.animal_ships[i].speed;
		                });
						
						if(!Game.values.confirmation_finish && (Enemies.shipsGroups.length>0) && (Enemies.shipsGroups[0].bounds.x < (Enemies.shipsGroups[0].bounds.width*(-1)+Zod.defaults.controllArea.min))){
							Game.confirm_finish();
							return;
							
		
						}
							

		            },
					
					remove_all_enemies: function(){
						$(Enemies.shipsGroups).each(function(i){
							Enemies.shipsGroups[i].removeChildren();
							Enemies.shipsReflectGroups[i].removeChildren();
						})
						
						shipsGroup.removeChildren();
						Enemies.shipsGroups.length = 0;
						Enemies.shipsReflectGroups.length = 0;

					},

		            init: function () {
		                if(this.shipsGroups.length > 0)
							this.remove_all_enemies();
						
						this.draw_ships(Game.current_level.animal_ships);
						
		            }

		        };


		    };


		var Scene = new function () {

		        return {
		            update: function () {
		                cloudsGroup.position.x -= 0.2;
		                balloonsGroup.position.x -= 0.15;
						
						if(Game.values.active || Game.values.confirmation_finish) Enemies.move_ships_to();
					
						if(Game.values.active){
							 
							if (Zod.shotsGroups.length) Zod.move_shots_to();
		              
							if (Zod.values.moved_to) Zod.move_gun_to();
						}

		            },

		            init: function () {

		                Background.sky();
		                Background.see();
		                Background.clouds();
		                Background.balloons();
		                //Background.clouds();
		                
		                Baza.ground();
		                Baza.tower();
		                Zod.ground();
		                Zod.gun();

		                zodAreaGroup = new Group();
		                zodAreaGroup.clipMask = false;

		                zodGroup = new Group();
		                zodGroup.clipMask = false;



		                Island.init();


		            }
		        }

		    }; 
		
		
		var Game = new function () { // basic game configuration, level dependencies
				var defaults = {
					canvas_element: $("#scene-canvas"),
					start_confirmation_window: $("#start-confirmation"),
					end_confirmation_window: $("#end-confirmation"),
					current_score_field: $("#current-score"),
					play_next: $("#play-next"),
					play_again: $("#play-again"),
					
					animal_ships: [{
						amount: 8,
						distance: view.bounds.width / 7,
						position_y: values.horizont + 40,
						scale: [0.5, 0.5],
						type: 1,
						speed: 1.2
					}, {
						amount: 4,
						distance: view.bounds.width / 5,
						position_y: values.horizont + 20,
						scale: [0.3, 0.2],
						type: 2,
						speed: 1
					}],
					
					values: {
						active: false,
						confirmation_start: false,
						confirmation_finish: false,
						ready_to_shot: true,
						total_ships:0,
						score: 0,
						current_level: 1
					}
				};

				return {
					values: defaults.values,
					
					init: function(){
						Scene.init();
						this.confirm_start()
					},
					confirm_start: function(){
						$(defaults.start_confirmation_window).delay(100).css({"top": (values.canvasHeight/3)-15+"px"}).fadeIn();
						Game.values.confirmation_start = true;
						function confirmed(object){
							Game.start();
							$(object).fadeOut();
							$(window).off();
							Game.values.confirmation_start = false;
							
						}
						
						$(defaults.start_confirmation_window).click(function(){
							confirmed(this);
							
						})
						$(window).keyup(function(event) {
							if (event.which == 32) {
								confirmed(defaults.start_confirmation_window);
							}							

						})

					},
					
					confirm_finish: function(){
						
						$(defaults.current_score_field).html(this.values.score)
						$(defaults.end_confirmation_window).css({"top": (values.canvasHeight/3)-15+"px"}).fadeIn();
						this.finish();						
						$(defaults.play_next).on("click", function(){
							$(this).off();
							$(defaults.end_confirmation_window).fadeOut();
							Game.next();
							
						});
						
						$(defaults.play_again).on("click", function(){
							$(this).off();
							$(defaults.end_confirmation_window).fadeOut();
							Game.again();
							
						})
					},
					
					start: function(i){
						
						if(i>this.values.current_level){
							this.level_up(i);
						};
						Enemies.init();
						this.values.active = true;
						this.values.confirmation_finish = false;
						this.total_ships();
						this.values.score = 0;
						Status.toScore(this.values.score)
						
					},
					
					next: function(){
					
						this.start(this.values.current_level+1);
						
					},
					
					again: function(){
					
						this.start(this.values.current_level);
						
					},
					
					finish: function(){
						this.values.active = false;
						this.values.confirmation_finish = true
					},
					
					total_ships: function(){
						Game.values.total_ships
						$(this.current_level.animal_ships).each(function(){
							Game.values.total_ships += this.amount;
						});
					},
					
					level_up: function(i){
						
						this.values.current_level++;
						$(this.current_level.animal_ships).each(function(){
							this.amount += 3 ;
							this.speed += .2;
							
						});
						
					},
					
					current_level: defaults,
					
					reset_level_to_default: function () {
						this.current_level = defaults;
						this.values = defaults.values;
					},
					
					reset_values_to_defaults: function(){
						this.values = defaults.values;
					}
				}
		};

		
		//Master initialization
		Game.init();
		
		
		

		function onFrameUni() {

		    Scene.update();

		}

		Scene.update();

		if (jQuery.browser.mozilla) {
		    function onFrameLoop() {

		        window.setTimeout(function () {


		            Scene.update();
		            view.draw();
		            onFrameLoop();

		        }, 1);

		    }
		    onFrameLoop();
		} else onFrame = onFrameUni;


		function onKeyDown(event) {
		    if (event.key == 'space') {
			
				if(Game.values.active && Game.values.ready_to_shot){
					Zod.start_to_shot();
								
					//return false;
				}
				
		    }
		

		    if (event.key == "right") {
		        Zod.values.moved_to = "right";

		        //status.toPrint(Zod.values.moved_to)
		        //return false;
		    };

		    if (event.key == "left") {
		        Zod.values.moved_to = "left";

		        //status.toPrint(Zod.values.moved_to)
		        //return false;
		    };

		}

		function onKeyUp(event) {

		    if (event.key == 'space') {

		        //status.toPrint("space");
				
		        return false;
		    };
			
			if (event.key == "left" || event.key == "right") Zod.values.moved_to = false;
			
			if (event.key == "shift"){
				var scale = ((view.bounds.width * view.bounds.height) /
                            (view.viewSize.width * view.viewSize.height)); 
				console.log(view)//.zoom+200
				
				view.zoom = view.zoom*1.2
				view.scale(1999, .1)
			
			}
		}


		function onMouseDrag(event) {
	
		}

		function onMouseUp(event) {
	
		}
