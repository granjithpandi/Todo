/*  Author Details
    ==============
    Author: Ranjith Pandi

    Author URL: http://ranjithpandi.com

    Attribution is must on every page, where this work is used.

    For Attribution removal request. please consider contacting us through http://ranjithpandi.com/#contact
*/

;(function ($) {

	var todoList = JSON.parse(localStorage.getItem("todoList")) || {};
	var todoData = JSON.parse(localStorage.getItem("todoData")) || {};

	var todo = {
		newList: function(id, title) {
			var $wrapper = $("<div />", {
					"class" : "todo-list",
					"id" : id
				});

			$("<h3 />", {
				"class" : "todo-header",
				"text" : title
			}).appendTo($wrapper);

			$("<div />", {
				"class" : "todo-card add-card",
				"text" : "Add a card..."
			}).appendTo($wrapper);

			return $wrapper;
		},

		newCard: function(id, obj) {
			var $wrapper = $("<div />", {
					"class" : "todo-card todo-data",
					"id" : id
				});

			$("<div />", {
				"text" : obj.title
			}).appendTo($wrapper);

			$("<i />", {
				"class" : "icon-pencil"
			}).appendTo($wrapper);

			$("<i />", {
				"class" : "icon-remove"
			}).appendTo($wrapper);

			if(obj.date != ""){
				$("<div />", {
					"class" : "todo-date",
					"text" : obj.date
				}).appendTo($wrapper);
			}

			return $wrapper;
		},

		constructList: function() {
			var self = this;
			for(var i in todoList) {
				var $wrapper = self.newList(i, todoList[i]);
				$( ".add-list" ).before($wrapper);
			}
		},

		constructCard: function() {
			var self = this;
			for(var i in todoData) {
				var $card = self.newCard(i, todoData[i]);
				$( "#" +todoData[i].list+ " div.add-card" ).before($card);
			}
		},

		addList: function() {
			var self = this;
			var title = $( ".add-list input" ).val();
			if(title == "") {
				return;
			}

			var id = 'list-' + new Date().getTime();
			todoList[id] = title;
			localStorage.setItem("todoList", JSON.stringify(todoList));

			var $newList = self.newList(id, title);
			$('.add-list').before($newList);

			$newList.droppable({
				drop: function(e, ui) {
					var $ele = ui.helper;
					self.moveCard($(this), $ele);
				}
			});
			this.showNewList();
		},

		showNewList: function() {
			$( ".add-list" ).html('<div class="new-list">Add a list...</div>');
		},

		showList: function(cur) {
			var self = this;
			var $taskInput = $("<div />", {
				"class" : "todo-input"
			});

			$("<input />", {
				"type" : "text",
				"value" : "",
				"placeholder" : "Add List ... "
			}).appendTo($taskInput);

			$("<a />", {
				"href" : "#",
				"class" : "btn btn-primary btn-success todo-button",
				"text" : "Save"
			}).appendTo($taskInput);

			$("<i />", {
				"class" : "icon-remove",
			}).appendTo($taskInput);

			var $ele = $(cur).parent();
			$ele.html($taskInput)
		      .find('a').on('click', function(e) {
				self.addList();
				e.preventDefault();
			})
			.end()
			.find('i').on('click', function() {
				self.showNewList();
			});

			$( ".todo-input input" ).focus();
		},

		addCard: function(cur, listId) {
			var $ele = $( "#" +listId+ " input:first" );
			var title = $ele.val();
			if( title == "" ){
				$ele.focus();
				return;
			}

			var dueDate = $( "#" +listId+ " input:last" ).val();

			var id = 'card-' + new Date().getTime();
			var obj = {'title': title, 'desc': '', 'date': dueDate, 'list': listId};
			todoData[id] = obj;
			localStorage.setItem("todoData", JSON.stringify(todoData));

			var $newCard = this.newCard(id, obj);
			$ele.parent().before($newCard).remove();

			$(cur).show();
			$newCard.draggable({ revert: "invalid", revertDuration:200 });
		},

		showCard: function(cur) {
			var self = this;
			var listId = $(cur).parent().attr('id');
			var $taskInput = $("<div />", {
				"class" : "todo-input todo-newcard"
			});

			$("<input />", {
				"type" : "text",
				"value" : "",
				"placeholder" : "Add Card ... "
			}).appendTo($taskInput);

			$("<input />", {
				"type" : "text",
				"id" : "duedate",
				"value" : "",
				"placeholder" : "Due Date (dd/mm/yyyy)"
			}).appendTo($taskInput);

			$("<a />", {
				"href" : "#",
				"class" : "btn btn-primary btn-success todo-button",
				"text" : "Save"
			}).appendTo($taskInput);

			$("<i />", {
				"class" : "icon-remove",
			}).appendTo($taskInput);

			$(cur).hide()
				.before($taskInput)
				.prev().find('a').on('click', function(e) {
					self.addCard(cur, listId);
					e.preventDefault();
				})
				.end()
				.find('i').on('click', function() {
					$(cur).show();
					$(this).parent().remove();
				});

			$( ".todo-input input:first" ).focus();
			$( "#duedate" ).datepicker({"dateFormat": "dd/mm/yy", "minDate": 0});
		},

		moveCard: function($ele, $cur) {
			var self = this;
			var listId = $ele.attr("id"),
				cardId = $cur.attr("id");
			var obj = todoData[cardId];
			obj['list'] = listId;

			todoData[cardId] = obj;
			localStorage.setItem("todoData", JSON.stringify(todoData));

			$( "#"+cardId ).remove();

			var $newCard = self.newCard(cardId, todoData[cardId]);
			$( "#" +listId+ " .add-card" ).before($newCard);
			$newCard.draggable({ revert: "invalid", revertDuration:200 });
		},

		cardDetails: function(id) {
			var self = this;
			var obj = todoData[id];

			var desc = (obj.desc != "")? obj.desc : "Add Description";
			var dateVal = (obj.date != "")? obj.date : "";

			$(".todo-title" ).html(obj.title);
			$( ".todo-desc" ).html(desc);
			$( "#datepicker" ).val(dateVal);

			buttonOptions = {
				"OK" : function() {
					self.saveDetails(id);
					$( ".todo-details" ).dialog("destroy");
				}
			};

			$( ".todo-details" ).dialog({
				autoOpen: true,
				modal: true,
				width: 600,
				height: 450,
				close: function( event, ui ) {
					self.saveDetails(id);
				},
				buttons: buttonOptions
			});
		},

		saveDetails: function(cardId){
			var title = $( ".todo-title" ).html();
			if( title == ""){
				return;
			}

			var desc = $( ".todo-desc" ).html() == "Add Description"? "" : $( ".todo-desc" ).html();
			var date = $( "#datepicker" ).val();

			var obj = todoData[cardId];
			obj['title'] = title;
			obj['desc'] = desc;
			obj['date'] = date;

			todoData[cardId] = obj;
			localStorage.setItem("todoData", JSON.stringify(todoData));

			var $newCard = this.newCard(cardId, obj);
			$( "#"+cardId ).replaceWith($newCard);
			$newCard.draggable({ revert: "invalid", revertDuration:200 });
		},

		removeCard: function(cardId) {
			$( "#"+cardId ).remove();

			delete todoData[cardId];
			localStorage.setItem("todoData", JSON.stringify(todoData));
		},

		listeners: function() {
			var self = this;
			$( ".add-list" ).on('click', 'div.new-list', function() {
				self.showList(this);
			});

			$( "#todo-container" ).on('click', 'div.add-card', function() {
				self.showCard(this);
			});

			$( ".todo-list:not('.add-list')" ).droppable({
				drop: function (e, ui) {
					var $ele = ui.helper;
					self.moveCard($(this), $ele);
				}
			});

			$( "#todo-container" ).on('click', '.todo-data', function() {
				var id = $(this).attr('id');
				self.cardDetails(id);
			});

			$( "#todo-container" ).on('click', '.icon-remove', function(e) {
				e.stopPropagation();
				var id = $(this).parent().attr('id');
				self.removeCard(id);
			});

			$( ".todo-data" ).draggable({ revert: "invalid", revertDuration:200 });

			$( ".todo-editable" ).on('click', function(e) {
				e.stopPropagation();
				$(this).attr('contenteditable','true').focus();
			});

			$( ".todo-details" ).on('click', function() {
				$( ".todo-editable" ).attr('contenteditable', 'false');
			});

			$( "#datepicker" ).datepicker({"dateFormat": "dd/mm/yy", "minDate": 0});
		},

		init: function(options) {
			this.showNewList();
			this.constructList();
			this.constructCard();

			this.listeners();
		}
	}

	$.fn.todoList = function(options) {
		todo.init(options);
	};

})(jQuery);