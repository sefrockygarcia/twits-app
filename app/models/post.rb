class Post < ApplicationRecord
  belongs_to :user

  validates :body, presence: true, length: {maximum: 255}

  def as_json(opts={})
    super(include: [:user]).merge(error: errors.full_messages&.to_sentence)
  end
end
