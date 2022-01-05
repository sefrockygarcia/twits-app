class PostsController < ApplicationController
  PER_PAGE = 5

  before_action :set_post, only: %i[ destroy ]

  # GET /posts or /posts.json
  def index
    respond_to do |format|
      format.html

      format.json {
        offset = params[:offset].to_i

        excluded = Post.where(private: true).where.not(user_id: current_user.id).ids
        base_query = Post.includes(:user).where.not(id: excluded).order(created_at: :desc).offset(offset)
        posts = base_query.limit(PER_PAGE)

        render json: {posts: posts, offset: offset + PER_PAGE, has_next: base_query.limit(PER_PAGE + 1).count > PER_PAGE}
      }
    end
  end

  # POST /posts or /posts.json
  def create
    post = current_user.posts.find_by(id: post_params[:id]) 
    
    if post
      post.update(post_params.except(:id))
    else
      post = current_user.posts.create(post_params.except(:id))
    end

    render json: post
  end

  # DELETE /posts/1 or /posts/1.json
  def destroy
    @post.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_post
      @post = Post.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def post_params
      params.require(:post).permit(:body, :private, :id)
    end
end
