Emailhush::Application.routes.draw do
  match "/auth/:provider/callback" => "sessions#create"
  match "/signout" => "sessions#destroy", :as => :signout

  match "/terms" => "terms#show"
  match "/privacy" => "privacy#show"
  match "/help" => "help#show"

  root :to => "dashboard#index", :constraints => ActiveUserConstraint
  root :to => 'home#index'

  resource :engine do
    resource :account do
      resource :state, :only => [:show, :create]
      resource :regen, :only => [:create]
      resource :schedule, :only => [:show]
      resource :statistic, :only => [:show]
      resource :override, :only => [:show, :create]
      resource :overrideMode, :only => [:show, :create]
      resource :timezone, :only => [:show, :create]
      resource :name, :only => [:show, :create]
    end
  end
end
