/**
 * Available for use under the MIT License (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * Copyright (c) 2014 - 2015 by Adam Banaszkiewicz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * @version 0.1.2
 * @date    2015.11.23
 * @author  Adam Banaszkiewicz
 */
(function($){
  $.fn.materialmenu = function(options) {
    var options = $.extend({
      /**
       * Define width of the window (in pixels) where starts mobile devices.
       * @type integer
       */
      mobileWidth: 767,
      /**
       * Width of the wrapper of menu. Works only on mbile.
       * @type integer
       */
      width: 250,
      /**
       * Time of animation.
       * @type integer
       */
      animationTime: 200,
      /**
       * Overlay opacity.
       * @type integer
       */
      overlayOpacity: 0.4,
      /**
       * Class of menu button that fires showing of menu.
       * @type string
       */
      buttonClass: 'material-menu-button',
      /**
       * If you want, you can define Your own menu button,
       * that be appended to generated title.
       * @type string
       */
      buttonHTML: '<div class="material-menu-button"><span></span><span></span><span></span></div>',
      /**
       * Page title, showed on mobile devices.
       * @type string
       */
      title: '',
      /**
       * Tells if title can be showed on mobile devices (only).
       * @type boolean
       */
      showTitle: false,
      /**
       * Number of pixels to scroll top, when title is showed on mobile devices.
       * If is 0, title will always be visible on top.
       * @type integer
       */
      titleShowOn: 40,
      /**
       * If true, menu will hide when user click on some menu item.
       * @type boolean
       */
      hideOnClick: true,
      /**
       * Fires when menu is opened.
       * @param  jQuery object element Menu (ul) object.
       * @return void
       */
      onOpen: function(element) {},
      /**
       * Fires when menu is closed.
       * @param  jQuery object element Menu (ul) object.
       * @return void
       */
      onClose: function(element) {},
      /**
       * Fires when window width is chenged from desktop to mobile.
       * @param  jQuery object element Menu (ul) object.
       * @return void
       */
      onChangeMobile: function(element) {
        element.parent().parent().addClass('vertical');
      },
      /**
       * Fires when window width is chenged from mobile to desktop.
       * @param  jQuery object element Menu (ul) object.
       * @return void
       */
      onChangeDesktop: function(element) {
        element.parent().parent().removeClass('vertical');
      },
      /**
       * Fires when title-bar is opened.
       * @param  jQuery object element Title-bar object.
       * @return void
       */
      onShowTitlebar: function(element) {},
      /**
       * Fires when title-bar is closed.
       * @param  jQuery object element Title-bar object.
       * @return void
       */
      onHideTitlebar: function(element) {}
    }, options);

    var MaterialMenu = function(element, options) {
      /**
       * Plugin options.
       * @type object
       */
      this.options = options;

      /**
       * Menu object.
       * @type jQuery object
       */
      this.element = element;

      /**
       * Overlay object.
       * @type jQuery object
       */
      this.overlay = $([]);

      /**
       * Title bar object.
       * @type jQuery object
       */
      this.title = $([]);

      /**
       * Tells if the title-bar is already opened.
       * @type boolean
       */
      this.isTitleShowed = false;

      /**
       * Tells if the menu is already opened.
       * @type boolean
       */
      this.isShowed = false;

      /**
       * Tells if this type of view was already changed.
       * This prevents multiple events,
       * @type boolean
       */
      this.changedOnMobile = false;

      /**
       * Tells if this type of view was already changed.
       * This prevents multiple events,
       * @type boolean
       */
      this.changedOnDesktop = false;

      /**
       * Coordinates of start's touch.
       * @type object
       */
      this.touchPosStart = {
        y : 0,
        x : 0
      };

      /**
       * Coordinates of end's touch.
       * @type object
       */
      this.touchPosEnd = {
        y : 0,
        x : 0
      };

      /**
       * Main, initialize function.
       * @return void
       */
      this.init = function() {
        var self = this;

        this.prepare();

        this.showMenuDependentByWidth();

        this.bindEvents();

        $(window).resize(function() {
          self.showMenuDependentByWidth();
        });
      };

      /**
       * Prepares elements.
       * @return void
       */
      this.prepare = function() {
        this.element.wrap($('<div />', { 'class': 'material-menu-wrapper' }));

        /**
         * If title have to be showed on page, we create it.
         */
        if(this.options.showTitle)
        {
          /**
           * If title-bar already exists, we don't need create another one.
           */
          var title = $('.material-menu-titlebar');

          if(title.length == 0)
          {
            $('<div />', { 'class': 'material-menu-titlebar', 'style': 'display:block;position:fixed;left:0px;top:0px;width:100%;height:55px;background-color:#fff;z-index:999998;' }).appendTo('body');

            // Get title element
            this.title = $('.material-menu-titlebar');

            // Add menu button
            this.title.append($(this.options.buttonHTML).addClass(this.options.buttonClass).css({ 'float': 'left', 'margin': '5px' }));

            // Add title text
            this.title.append('<div class="material-menu-title" style="float:left;line-height:55px;height:55px;margin-left:10px;">' + this.options.title + '</div>');

            // Show or hide title-bar, by user defined option
            if(this.options.titleShowOn == 0)
              this.showTitle();
            else
              this.hideTitle();
          }
          else
          {
            this.title = title;
          }

          this.title.hide();
        }



        var overlay = $('.material-menu-overlay');

        /**
         * If overlay already exists, we don't need create another one.
         */
        if(overlay.length == 1)
        {
          this.overlay = overlay;
        }
        /**
         * If not exists, we create it.
         */
        else
        {
          $('<div />', { 'class': 'material-menu-overlay', 'style': 'display:block;position:fixed;left:0px;top:0px;width:100%;height:100%;z-index:999998;background-color:#000000;' }).appendTo('body');

          this.overlay = $('.material-menu-overlay');
        }

        this.overlay
          // When we show overlay, help us an fade function, so we have to
          // hide element by opacity too.
          .fadeTo(0, 0)
          // Default, overlay must be hidden
          .css('display', 'none');
      };

      /**
       * Bind events on elements.
       * @return void
       */
      this.bindEvents = function() {
        var self = this;

        // Menu button
        $('.' + this.options.buttonClass).click(function() {
          if(self.isShowed)
            self.close();
          else
            self.open();
        });

        // Overlay
        this.overlay.click(function() {
          self.close();
        });

        // Title
        $(window).scroll(function() {
          if($(this).scrollTop() >= self.options.titleShowOn)
            self.showTitle();
          else
            self.hideTitle();
        });

        if($(window).scrollTop() >= self.options.titleShowOn)
        {
          self.showTitle();
        }

        // Hide on click in menu item
        if(self.options.hideOnClick)
        {
          self.element.find('a').click(function() {
            self.close();
          });
        }

        // Close on touch slide in left
        this.bindTouchClose();
      };

      /**
       * Function change menu parent class and style dependent by window width.
       * @return void
       */
      this.showMenuDependentByWidth = function() {
        if(this.getWindowWidth() <= this.options.mobileWidth)
          this.showForMobile();
        else
          this.showForDesktop();

        if(this.isShowed)
          this.close();
      };

      /**
       * Do operations when width of client windowd is smaller than mobile breakpoint.
       * @return void
       */
      this.showForMobile = function() {
        // Prevent multiple changes / events
        if(this.changedOnMobile == false)
        {
          this.element
            .parent() // parent == wrapper
            .removeClass('material-menu-view-desktop')
            .addClass('material-menu-view-mobile')
            .css({
              display: 'none',
              position: 'fixed',
              top: '0px',
              zIndex: '999999',
              overflow: 'auto',
              height: '100%',
              width: this.getMenuWidth() + 'px',
              left: '-' + this.getMenuWidth() + 'px'
            });

          if(this.options.showTitle)
          {
            this.showTitle();
          }

          this.changedOnDesktop = false;
          this.changedOnMobile  = true;

          this.options.onChangeMobile(this.element);
        }
      };

      /**
       * Do operations when width of client windowd is bigger than mobile breakpoint.
       * @return void
       */
      this.showForDesktop = function() {
        // Prevent multiple changes / events
        if(this.changedOnDesktop == false)
        {
          this.element
            .parent() // parent == wrapper
            .removeClass('material-menu-view-mobile')
            .addClass('material-menu-view-desktop')
            .css({
              display: 'block',
              position: 'static',
              top: 'auto',
              zIndex: 'auto',
              overflow: 'visible',
              height: 'auto',
              width: 'auto',
              left: 'auto'
            });

          if(this.options.showTitle)
          {
            this.hideTitle();
          }

          this.changedOnDesktop = true;
          this.changedOnMobile  = false;

          this.options.onChangeDesktop(this.element);
        }
      };

      /**
       * Opens menu.
       * @return void
       */
      this.open = function() {
        var self = this;

        if(self.isShowed == false && self.getWindowWidth() <= self.options.mobileWidth)
        {
          self.isShowed = true;

          self.element.parent().show().animate({
            left: '0px'
          }, self.options.animationTime);

          self.overlay.css('display', 'block').fadeTo(self.options.animationTime, self.options.overlayOpacity);

          // We stop scrolling (desktop) body, when user see menu
          $('body').css('overflow', 'hidden');

          self.options.onOpen(self.element);
        }
      };

      /**
       * Close menu.
       * @return void
       */
      this.close = function() {
        var self = this;

        if(self.isShowed == true)
        {
          self.isShowed = false;

          self.element.parent().animate({
            left: '-' + self.getMenuWidth() + 'px'
          }, self.options.animationTime, function() {
            $(this).hide();
          });

          self.overlay.fadeTo(self.options.animationTime, 0, function() {
            $(this).css('display', 'none');
            self.options.onClose(self.element);
          });

          // We stop scrolling (desktop) body, when user see menu
          $('body').css('overflow', 'auto');
        }
      };

      /**
       * Shows title.
       * @return void
       */
      this.showTitle = function() {
        if(this.isTitleShowed == false && this.changedOnMobile == true)
        {
          this.title.show().fadeTo(this.options.animationTime, 1);
          this.isTitleShowed = true;
          this.options.onShowTitlebar(this.title);
        }
      };

      /**
       * Hide title.
       * @return void
       */
      this.hideTitle = function() {
        if(this.isTitleShowed == true)
        {
          this.title.fadeTo(this.options.animationTime, 0, function() {
            $(this).hide();
          });
          this.isTitleShowed = false;
          this.options.onHideTitlebar(this.title);
        }
      };

      /**
       * Closes menu when user swipe to left on menu or it's overlay.
       * @return void
       */
      this.bindTouchClose = function() {
        var self = this;
        var elements = [ this.element, this.overlay ];

        for(var i in elements)
        {
          if(elements[i][0] && elements[i][0].addEventListener && !elements[i].data('materialmenu-binded-touchclose'))
          {
            elements[i].data('materialmenu-binded-touchclose', '1');
            
            elements[i][0].addEventListener('touchstart', function(event) {
              self.touchPosStart.x = event.touches[0].pageX;
              self.touchPosStart.y = event.touches[0].pageY;
            }, false);
            
            elements[i][0].addEventListener('touchend', function(event) {
              if(self.getTouchDirection() == 'left')
              {
                self.close();
              }
            }, false);
            
            elements[i][0].addEventListener('touchmove', function(event) {
              self.touchPosEnd.x = event.touches[0].pageX;
              self.touchPosEnd.y = event.touches[0].pageY;
            }, false);
          }
        }
      };

      /**
       * Returns menu width in pixels in mobile view.
       * @return integer
       */
      this.getMenuWidth = function() {
        return this.options.width;
      };

      /**
       * Returns client window width in pixels.
       * @return integer
       */
      this.getWindowWidth = function() {
        //Non-IE
        if(typeof( window.innerWidth ) == 'number')
          return window.innerWidth;
        //IE 6+ in 'standards compliant mode'
        else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight))
          return document.documentElement.clientWidth;
        //IE 4 compatible
        else if(document.body && (document.body.clientWidth || document.body.clientHeight))
          return document.body.clientWidth;
        else
          return $('body, html').width();
      };

      /**
       * Calculate and returns direction which user move his finger (touch).
       * @return string Name of direction.
       */
      this.getTouchDirection = function() {
        var differenceX = Math.abs(this.touchPosStart.x - this.touchPosEnd.x);
        var differenceY = Math.abs(this.touchPosStart.y - this.touchPosEnd.y);
        
        if(differenceX > differenceY)
          if(this.touchPosStart.x > this.touchPosEnd.x)
            return 'left';
          else
            return 'right';
        else
          if(this.touchPosStart.y > this.touchPosEnd.y)
            return 'up';
          else
            return 'down';
      };
    };

    return $(this).each(function() {
      var menu = new MaterialMenu($(this), options);
          menu.init();
    });
  };
})(jQuery);
