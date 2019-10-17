(function() {
  $.ajax("/api/v1/posts").done(function(posts) {
    console.log(posts)
    posts.sort((one, two) => new Date(two.post.createdAt) - new Date(one.post.createdAt));
    console.log(posts)
    $("#posts").html(
      posts.map(
        p =>
          `<div class="gram-card">
                <div class="gram-card-header">
                  <img src="${
                    p.author.profile_picture
                  }?cache=${Math.random()}" class="gram-card-user-image lozad">
                  <a class="gram-card-user-name" href="/u/@${
                    p.author.username
                  }">${p.author.username}</a>
            
                        <div class="dropdown gram-card-time">
                          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> <i class="glyphicon glyphicon-option-vertical"></i></a>
                          <ul class="dropdown-menu dropdown-menu-right">
                          ${
                            p.post.static_url != undefined
                              ? "<li><a href=" +
                                p.post.static_url +
                                '><i class="fa fa-share"></i> View</a></li>'
                              : ""
                          }
                        ${
                          p.owner
                            ? `
                              <li><a href="/me/post/${p.post._id}"><i class="fa fa-cog"></i> Edit</a></li>
                              <li><a href="/me/post/delete/${p.post._id}"><i class="fa fa-trash"></i> Delete</a></li>
                            `
                            : ""
                        }
                          </ul>
                          </div>
                          <div class="time">${p.post.timeago}</div>
                </div>
            <br>
            <br>
                <div class="gram-card-image">
                  ${
                    p.post.static_url
                      ? `${
                          p.post.type == "png" ||
                          p.post.type == "jpg" ||
                          p.post.type == "jpeg"
                            ? `
                  <center>
                    <a href="${p.post.static_url}" class="progressive replace">
                        <img author="${p.author.username}" src="" id="${p.post._id}" class="post img-responsive lozad preview">
                    </a>        
                  `
                            : `
                  <video author="${p.author.username}" src="${p.post.static_url}" id="${p.post._id}" class="post img-responsive" controls></video>
                  `
                        }`
                      : p.post.code ? `<pre style="margin:5%">${p.post.code}</pre>` : ""
                  }
                  </center>
                </div>
                <div class="gram-card-content">
            
                  <p><a class="gram-card-content-user" href="/u/@${
                    p.author.username
                  }">${p.author.username}</a>
                  ${p.post.caption}
                    <span class="label label-info">${p.post.category ? p.post.category : p.post.code ? "Code" : "Unknown"}</span>
            
                 </p>
            
                  <p class="comments">${p.post.comments.length} comment(s).</p>
                  <br>
            
                  <div class="comments-div">
            
                  <div>
                   ${p.post.comments.map(
                     c => `
                    <a class="user-comment" href="/u/@${c.by}">
                        ${c.by}
                    </a>
                    ${c.text}
                    <br>
                   `
                   ).join("")}
                  </div>
            
                  </div>
                <hr>
                </div>
            
                <div class="gram-card-footer">
                  <button data="${JSON.stringify(p.post.likes)}" ${
            p.post.likes.includes($("#posts").attr("username"))
              ? "disabled"
              : ""
          } onclick="this.innerHTML =  ${`'<i class=\\'glyphicon glyphicon-thumbs-up\\'></i> ' + (parseInt(${p.post.likes.length}) + 1); this.disabled = true;`}" class="footer-action-icons likes btn btn-link non-hoverable like-button-box" author="${
            p.author.username
          }" id="${p.post._id}-like">
                    <i class="glyphicon glyphicon-thumbs-up"></i> ${
                      p.post.likes.length
                    }</button>
            
                  <input id="${
                    p.post._id
                  }" class="comments-input comment-input-box" author="${
            p.author.username
          }" type="text" id="comment" placeholder="Click enter to comment here..."/>
            
                </div>
            
              </div>`
      ).join(" ")
    );
    $(".like-button-box").on("click", likeById);
    $(".post").dblclick(likeById);

    function likeById() {
      console.log(this.id);
      var author = $(`#${this.id}`).attr("author");
      $.ajax({
        method: "POST",
        url: "/api/v1/like?cache=" + Math.random(),
        data: {
          _id: this.id.toString().split("-like")[0],
          author: author
        }
      })
        .done(function(data) {
          if (data.event) {
            show_notification(data.msg, "success");
          } else {
            show_notification(data.msg, "danger");
          }
        })
        .fail(function(data) {
          show_notification("Some error while liking the feed", "danger");
          console.log(data);
        });
    }
    $(".comment-input-box").on("keydown", commentById);

    function commentById(key) {
      if (!this.value) return;
      else if (key.keyCode == 13) {
        var author = $(`#${this.id}`).attr("author");
        console.log(author);
        $.ajax({
          method: "POST",
          url: "/api/v1/comment",
          data: {
            _id: this.id,
            author: author,
            text: this.value
          }
        })
          .done(function(data) {
            show_notification("Adding comment!", "success");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          })
          .fail(function(data) {
            show_notification(
              "Some error while posting the comment.",
              "danger"
            );
            console.log(data);
          });
      }
    }
  });
})();
