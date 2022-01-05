Rails.application.routes.draw do
  resources :posts, only: [:index, :create, :destroy]
  devise_for(:users, path: "", path_names: {sign_in: "login", sign_out: "logout"}, controllers: { registrations: "registrations" })
  root "posts#index"
end
