function updateList(query, type) {
  if(type == "search") {
    $.ajax({
          method: 'GET',
          url: '/api/v1/search',
          data: {
            q:query,
            lang: $("#lang-select").val()
             }
      })
      .done(function(data){
          console.log(data);
          $("#user-list").text('');
          for (var i = 0; i < data.length; i++) {
            $("#user-list").append(`<li class="list-group-item">
               <img src="${data[i].profile_picture}" class="logo">
               <b><a href="/u/@${data[i].username}" id="list-username">${data[i].username}</a></b>
            </li>`)
          }


      })
      .fail(function(data){
        show_notification('Oops! Some error out there.','danger')
      });
  }
  else if(type == "lang") {
    $.ajax({
          method: 'GET',
          url: '/api/v1/search',
          data: {
            q:$("#search-box").val(),
            lang: query
             }
      })
      .done(function(data){
          //show_notification('','success');
          console.log(data);
          $("#user-list").text('');
          for (var i = 0; i < data.length; i++) {
            $("#user-list").append(`<li class="list-group-item">
               <img src="${data[i].profile_picture}" class="logo">
               <b><a href="/u/@${data[i].username}" id="list-username">${data[i].username}</a></b>
               <i class="badge">${query.toLowerCase()}</i>
            </li>`)
          }


      })
      .fail(function(data){
        show_notification('Oops! Some error out there.','danger')
      });
  }
}
