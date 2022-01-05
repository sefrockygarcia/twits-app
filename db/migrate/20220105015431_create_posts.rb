class CreatePosts < ActiveRecord::Migration[6.1]
  def change
    create_table :posts do |t|
      t.text :body, null: false, default: ""
      t.belongs_to :user, null: false, foreign_key: true
      t.boolean :private, default: false

      t.timestamps
    end
  end
end
