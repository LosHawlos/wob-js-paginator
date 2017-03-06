$.fn.jsPaginator = function(){
	if( $(this).data('jsPaginatorInstance')) {
		return $(this).data('jsPaginatorInstance');
	}
	this.targetId = '#'+$(this).data('paginate-list');
	this.target = $(this.targetId);
	this.pagesize = $(this).data('pagesize');
	this.limitPager = parseInt( $(this).data('limit-pager'));
	this.showFirstLast = parseInt( $(this).data('pager-show-first-last'));
	this.currentPage = 1;
	this.numElements = 0;
	this.numPages = 0;
	
	this.filters = {};

	var paginator = this;
	
	this.children().each(function() {
		$(this).find('a').click(function(e) {
			var page = $(this).parents('[data-page]').data('page');
			paginator.showPage( page);
			return false;
		});
	});
	
	this.updateFilter = function( filters){
	// console.log("updateFilter");
	// console.log(filters);
		this.filters = filters;
		this.currentPage = 1;
		this.update();
	};
	
	this.showPage = function( page) {
		//console.log("showPage "+page);
		if( typeof page == 'string') {
			if( page.startsWith( '-') || page.startsWith( '+')) {
				page = this.currentPage + parseInt(page);
			}
		} else if( page < 0){
			page = this.currentPage + page;
		}
		if( page > 0 && page <= this.numPages) {
			this.currentPage = page;
			this.update();
		}
	};
	
	this.matchesFilter = function( elem) {
		//console.log('matchesFilter');
		var hasFilter = false;
		var filterIsMatch = true;
		for( var filterName in this.filters) {
			if( this.filters[filterName] && this.filters[filterName].length) {
				hasFilter = true;
				var subFilterMatch = false;
				var filterValues = this.filters[filterName];
				for( var idx in filterValues) {
					var filterValue = filterValues[idx];
					if( typeof filterValue == 'number' || typeof filterValue == 'string') {
						if( typeof elem.data(filterName) == 'number') {
							if( elem.data(filterName) == filterValue) {
								subFilterMatch = true;
							}
						} else if( typeof elem.data(filterName) == 'string') {
							var valueList = elem.data(filterName).split(',');
							//console.log(valueList);
							for( var vdx in valueList) {
								if( typeof valueList[vdx] == 'string') {
									if( valueList[vdx] == filterValue) {
										subFilterMatch = true;
									}
								}
							}
						}
					} else {
						console.log('filterValue of invalid type: '+(typeof filterValue));
					}
				}
				if( ! subFilterMatch) {
					filterIsMatch = false;
				}
			}
		}
		if( ! hasFilter) {
			if( $(elem).data('nofilter') == 'hide') {
				return false;
			}
			return true;
		}
		return filterIsMatch;
	};
	this.matchFilter = function() {
		//console.log("matchFilter");
		this.numElements = 0;
		this.numPages = 0;
		this.target.children().each(function(){
			if( ! paginator.filters) {
				$(this).data('visible', 1);
				if( paginator.pagesize) {
					$(this).data('page', Math.floor( paginator.numElements / paginator.pagesize)+1);
				} else {
					$(this).data('page', 1);
				}
				paginator.numElements ++;
			} else if( paginator.matchesFilter( $(this))) {
				$(this).data('visible', 1);
				if( paginator.pagesize) {
					$(this).data('page', Math.floor( paginator.numElements / paginator.pagesize)+1);
				} else {
					$(this).data('page', 1);
				}
				paginator.numElements ++;
			} else {
				$(this).data('visible', '');
			}
		});
		paginator.numPages = Math.ceil( paginator.numElements / paginator.pagesize);
		//console.log(this.numElements);
	};
	this.updateList = function(){
		this.target.children().each(function(){
			if( $(this).data('page') == paginator.currentPage && $(this).data('visible')) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	};
	this.updatePaginator = function(){
		this.children().each(function() {
			if( typeof $(this).data('page') === 'string' && $(this).data('page').startsWith('-')) {
				// Handle prev-Button (page as string)
				if( paginator.currentPage + parseInt($(this).data('page')) >= 1) {
					$(this).removeClass('disabled');
				} else {
					$(this).addClass('disabled');
				}
			} else if( $(this).data('page') < 0) {
				// Handle prev-Button (page as int)
				if( paginator.currentPage + $(this).data('page') >= 1) {
					$(this).removeClass('disabled');
				} else {
					$(this).addClass('disabled');
				}
			} else if( typeof $(this).data('page') === 'string' && $(this).data('page').startsWith('+')) {
				// Handle next-Button
				if( paginator.currentPage + parseInt($(this).data('page')) <= paginator.numPages) {
					$(this).removeClass('disabled');
				} else {
					$(this).addClass('disabled');
				}
			} else if( $(this).data('page') > paginator.numPages) {
				// hide pages higher than the number of pages
				$(this).hide();
			} else if( $(this).data('page') === paginator.currentPage) {
				// Highlight active page
				$(this).addClass('active');
				$(this).show();
			} else {
				// Show other useable pages
				$(this).removeClass('active');
				$(this).show();
			}
			
			if( paginator.limitPager > 0 && $(this).data('page') > 0 && typeof($(this).data('page')) == 'number') {
				// Show only this number of next/prev pages
				var minPage = paginator.currentPage - paginator.limitPager;
				var maxPage = paginator.currentPage + paginator.limitPager;
				if( minPage < 1) {
					maxPage += 1 - minPage;
				}
				if( maxPage > paginator.numPages) {
					minPage -= maxPage - paginator.numPages;
				}
				if( paginator.showFirstLast) {
					if( minPage > 1) {
						minPage ++;
					}
					if( maxPage < paginator.numPages) {
						maxPage--;
					}
				}
				
				if( ! paginator.showFirstLast || (paginator.showFirstLast && ($(this).data('page') != 1 && $(this).data('page') != paginator.numPages))) {
					if( $(this).data('page') < minPage) {
						$(this).hide();
					}
					if( $(this).data('page') > maxPage) {
						$(this).hide();
					}
				}
				if( $(this).data('page') == 1 && minPage > 2) {
					$(this).addClass( 'gap-after');
				} else {
					$(this).removeClass( 'gap-after');
				}
				if( $(this).data('page') == paginator.numPages && maxPage < (paginator.numPages-1)) {
					$(this).addClass( 'gap-before');
				} else {
					$(this).removeClass( 'gap-before');
				}
			}
		});
	};
	this.update = function(){
		this.matchFilter();
		this.updateList();
		this.updatePaginator();
	};
	
	this.update();
	
	this.getAvailableCriteria = function( criteria){
		var list = [];
		this.target.children().each(function() {
			if( typeof( $(this).data( criteria)) == 'number') {
				list.push( $(this).data( criteria));
			} else if( $(this).data( criteria)) {
				var valueList = (''+$(this).data(criteria)).split(',');
				list = $.merge( list, valueList);
			}
		});
		return $.uniqueSort( list);
	};
	
	this.criteriaIsInList = function( value, list) {
		hasMatched = false;
		$.each( list, function( idx, val) {
			if( value == val) {
				hasMatched = true;
			}
		});
		return hasMatched;
	};
	
	$(this).data('jsPaginatorInstance', this);
	return this;
};

