var nsGmx = nsGmx || {};

(function() {

nsGmx.LayersTreeNode = Thorax.Model.extend({
    constructor: function(rawTreeNode, parent) {
        Backbone.Model.apply(this);
        
        var props = rawTreeNode.content.properties,
            rawChildren = rawTreeNode.content.children;
            
        this.id = props.GroupID || props.name;
        
        this.set({
            parent: parent,
            visible: !!props.visible,
            list: !!props.list,
            properties: props,
            geometry: rawTreeNode.content.geometry,
            depth: parent ? parent.get('depth') + 1 : 0,
            expanded: !!props.expanded
        });

        if (rawChildren && rawChildren.length) {
            var children = new LayersTreeChildren(
                _.map(rawChildren, function(child) {
                    var node = new nsGmx.LayersTreeNode(child, this);
                    node.on({
                        change: function() {
                            this.trigger('childChange', node);
                        }, 
                        childChange: function(targetNode) {
                            this.trigger('childChange', targetNode);
                        }
                    }, this);
                    return node;
                }, this)
            );
            this.set('childrenNodes', children, {silent: true});
        }

        this.on('change:list', function(){this.updateNodeVisibility();}, this);

        return this;
    },
    
    _setSubtreeVisibility: function(isVisible) {
        var attrs = this.attributes;
        if (attrs.visible != isVisible) {
            this.set('visible', isVisible);
            
            if (attrs.childrenNodes) {
                for (var c = 0; c < attrs.childrenNodes.length; c++) {
                    var vis = isVisible && (!attrs.list || c == 0); //когда делаем видимой группу-список, виден только первый элемент группы
                    attrs.childrenNodes.at(c)._setSubtreeVisibility(vis);
                }
            }
        }
    },
    
    setNodeVisibility: function(isVisible) {        
        //устанавливаем видимость поддерева, которое начинается с этого элемента
        this._setSubtreeVisibility(isVisible);
        
        //идём вверх по дереву до корня и меняем видимость родителей
        var parent = this.attributes.parent;
        parent && parent.updateNodeVisibility(this);
    },
    
    
    updateNodeVisibility: function(triggerSubnode) {
        var attrs = this.attributes,
            isList = attrs.list,
            children = attrs.childrenNodes,
            triggerNodeVisible = triggerSubnode ? triggerSubnode.get('visible') : false,
            visibleNode = triggerNodeVisible ? triggerSubnode : null;
        
        var isVisible = false;
        
        if (children) {
            for (var c = 0; c < children.length; c++) {
                var child = children.at(c);
                var childVisible = child.get('visible');
                isVisible = isVisible || childVisible;
                
                if (childVisible && !visibleNode) {
                    visibleNode = child;
                }
                
                if (isList && childVisible && child !== visibleNode) {
                    child._setSubtreeVisibility(false);
                }
            }
        }

        if (isVisible !== attrs.visible) {
            this.set('visible', isVisible);
            
            var parent = this.attributes.parent;
            parent && parent.updateNodeVisibility(this);
        }
    },
    
    find: function(id) {
        if (this.id == id) {
            return this;
        }
        var children = this.attributes.childrenNodes;
        return children && children.reduce(function(memo, node) {
            return memo || node.find(id);
        }, null);
    },
    
    getBounds: function() {
        if (typeof L === 'undefined') {
            return null; //Leaflet is required to calculate bounds
        }
        
        var attrs = this.attributes;
        if (attrs.geometry) {
            return L.bounds(attrs.geometry.coordinates[0]);
        }
        
        var bounds = L.bounds([]);
        
        if (attrs.childrenNodes) {
            attrs.childrenNodes.each(function(child) {
                var b = child.getBounds();
                b.isValid() && bounds.extend(b.min).extend(b.max);
            })
        }
        return bounds;
    },
    
    getLatLngBounds: function() {
        var unproject = L.Projection.Mercator.unproject.bind(L.Projection.Mercator),
            bounds = this.getBounds();
        
        if (bounds.isValid()) {
            return L.latLngBounds(unproject(bounds.min), unproject(bounds.max));
        } else {
            return L.latLngBounds([]);
        }
    },
    
    _saveState: function(state) {
        var attrs = this.attributes;
        if (attrs.childrenNodes) {
            state.expanded[this.id] = attrs.expanded;
            attrs.childrenNodes.each(function(node) {
                node._saveState(state);
            })
        } else {
            state.visible[this.id] = attrs.visible;
        }
        return state;
    },
    saveState: function() {
        return this._saveState({
            expanded: {},
            visible: {},
            version: '1.0.0'
        });
    },
    loadState: function(state, applyInitialState) {
        var nodeState = state[this.id],
            attrs = this.attributes,
            children = attrs.childrenNodes;
            
        if (children) {
            if (this.id in state.expanded) {
                this.set('expanded', state.expanded[this.id]);
            } else if (applyInitialState){
                this.set('expanded', !!attrs.properties.expanded);
            }
            
            children.each(function(node) {
                node.loadState(state, applyInitialState);
            })
        } else {
            if (this.id in state.visible) {
                this.setNodeVisibility(state.visible[this.id]);
            } else if (applyInitialState){
                this.setNodeVisibility(!!attrs.properties.visible);
            }
        }
    },
    
    eachNode: function(visitor, onlyLeaves) {
        var children = this.attributes.childrenNodes;
        
        if (!onlyLeaves || !children) {
            visitor(this);
        }
        
        children && children.forEach(function(child) {
            child.eachNode(visitor, onlyLeaves);
        })
    },
    
    isLastInLevel: function() {
        var model = this,
            parent = model.get('parent');
                
        while (parent) {
            if (parent.get('childrenNodes').indexOf(model) < parent.get('childrenNodes').length-1) {
                return false;
            }
            model = parent;
            parent = model.get('parent');
        }
        
        return true;
    }
})

var LayersTreeChildren = Thorax.Collection.extend({model: nsGmx.LayersTreeNode});

})();
