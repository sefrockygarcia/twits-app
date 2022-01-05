// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
// import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"
import "channels"
import "jquery"

Rails.start()
// Turbolinks.start()
ActiveStorage.start()

// global variables
let posts = [];
let offset = 0;
let hasNext = false;
let currentUserId = null;

class Post {
  constructor(post) {
    this.post = post;
    this.user = post.user;
  }

  submit() {
    $.post("/posts.json", this.post, (data) => {
      let p = posts.find(p => p.id == data.id);
      if (p) {
        p.private = data.private;
        p.body = data.body;
      } else {
        posts.push(data);
      }

      let x = new Post(data)
      x.render();

      $("#post_id").val("");
    });
  }

  html() {
    let x = currentUserId != this.user.id ? '' : `<div class="card-action">
                                                    <a href="#" class="edit-post">Edit</a>
                                                    <a href="#" class="delete-post">Delete</a>
                                                  </div>`

    return(`
          <div class="col s12 post-card" data-id="${this.post.id}">
            <div class="card">
              <div class="card-content">
    
                <div class="card-header">
                  <img src="https://via.placeholder.com/45x45" class="circle" width="45" height="45">
                  <span class="card-title">${this.user.name}</span>
                </div>
    
                <p>${this.post.body}</p>
              </div>
              ${x}
            </div>
          </div>
        `)
  }

  render() {
    if (this.post.error.length) {
      M.toast({html: this.post.error});
    } else {
      let c = $(`.post-card[data-id="${this.post.id}"]`);
      if (c.length) {
        c.replaceWith(this.html());
      } else {
        console.log('new')
        $("#list-of-post").prepend(this.html());
      }
    }
  }
}

let getPosts = () => {
  $.get("/posts.json", {offset: offset}, (data) => {
    posts = posts.concat(data.posts);
    offset = data.offset;
    hasNext = data.has_next;

    let html = posts.map(datum => {
      let post = new Post(datum);
      return post.html();
    });

    $("#list-of-post").html(html);
  });
}



$(document).ready(() => {
  currentUserId = +$("#current-user-id").val();

  M.AutoInit();

  getPosts();

  // infinite scrolling
  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
      if(hasNext)
        $.get(getPosts());
    }
  });

  // form submit post
  $("#post-form").submit((e) => {
    e.preventDefault();

    let params = {
      post: {
        body: $("#post_body").val(), 
        private: $("#post_private").is(":checked"), 
        id: $("#post_id").val()
      }
    };
    let post = new Post(params)
    post.submit()

    $("#post-form").get(0).reset();
  })

  // form cancel post
  $("#cancel-post").click(() => $("#post-form").get(0).reset());

  // card edit post
  $("#list-of-post").on("click", ".edit-post", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let id = $(e.target).closest(".post-card").data("id");
    let p = posts.find(p => p.id == id);

    $("#post_id").val(p.id);
    $("#post_private").prop("checked", p.private);
    $("#post_body").val(p.body).focus();
  });

  // card delete post
  $("#list-of-post").on("click", ".delete-post", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let $card = $(e.target).closest(".post-card");
    let id = $card.data("id");

    $.post(`/posts/${id}.json`, {_method: "delete"}, () => $card.remove());
  });
})