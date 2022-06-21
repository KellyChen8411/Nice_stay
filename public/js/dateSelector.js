$( function() {
      from = $( "#startDate" )
        .datepicker({
          defaultDate: "+1w",
          dateFormat: "yy-mm-dd",
          changeMonth: true,
          numberOfMonths: 1,
          minDate: 0
        })
        .on( "change", function() {
            var currentDate = from.datepicker( "getDate" );
            var nextDate = new Date((currentDate).valueOf() + 1000*3600*24);
          to.datepicker( "option", "minDate", nextDate );
        })
        .on("click", function(){
            $( "#endDate" ).val("");
        }),
      to = $( "#endDate" ).datepicker({
        defaultDate: "+1w",
        dateFormat: "yy-mm-dd",
        changeMonth: true,
        numberOfMonths: 1,
        minDate: "+1d"
      })

      $( "#area" ).selectmenu();

      let peopleTag = $('#people');
      let peopleAreaTag = $('#peopleSelectArea')
      let leftPosition = Math.round(peopleTag.position().left)
      peopleAreaTag.css("left", leftPosition);
      peopleTag.focus(function(){
        peopleAreaTag.removeClass("PAHide");
        peopleAreaTag.addClass("PAShow");
      })
      let peopleBtn = $('#peopleBtn');
      peopleBtn.click(function(){
        peopleAreaTag.removeClass("PAShow");
        peopleAreaTag.addClass("PAHide");
        let humanCount = human.spinner( "value" );
        let petCount = pet.spinner( "value" );
        if( !(humanCount === 0 && petCount === 0)){
          let peoleSelectResult = `${humanCount},${petCount}`;
          peopleTag.val(peoleSelectResult);
        }
      })

      let human = $( "#human" ).spinner({
        min: 0
      }).val(0);
      let pet = $( "#pet" ).spinner({
        min: 0
      }).val(0);

      let hamburgerIcon = $('#hamburgerContainer');
      hamburgerIcon.click(showPersonalList);
      let personalArea = $('#personalArea');
      personalArea.css("right", "20px");

      function showPersonalList(){
        if(personalArea.hasClass("PAHide")){
            personalArea.removeClass("PAHide");
            personalArea.addClass("PAShow");
        }else{
            personalArea.removeClass("PAShow");
            personalArea.addClass("PAHide");
        }
      }

      $('#houseArea').click(addToFavorite);

      function addToFavorite(e){
        console.log(e.target.nodeName);
        if(e.target.nodeName === "I"){
          e.target.classList.toggle("grey");
          e.target.classList.toggle("red");
          console.log(e.target.parentElement.dataset.id);
        }
        if(e.target.nodeName === "IMG"){
          let house_id = e.target.dataset.id;
          let startDate = $('#startDate').val();
          let endDate = $('#endDate').val();
          let peopleCount = $('#people').val().split(',')[0];
          window.open(`/detail.html?id=${house_id}&startDate=${startDate}&endDate=${endDate}&people_count=${peopleCount}`, 'Nice Stay')
        }
      }

      $( "#price_range" ).slider({
        range: true,
        min: 300,
        max: 100000,
        values: [ 0, 100000 ],
        slide: function( event, ui ) {
        $('#start_price').val(ui.values[ 0 ]);
        $('#end_price').val(ui.values[ 1 ]);
        }
      });

      //細節篩選單顯示
      $('#detailSearch').click(function(){
        $('#detailSearchList').removeClass('DSHide')
      });

      //細節篩選單關閉
      $('#close_icon').click(function(){
        $('#detailSearchList').addClass('DSHide')
      }

      )


      
});