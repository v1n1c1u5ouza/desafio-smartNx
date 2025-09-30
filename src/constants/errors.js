export const ERRORS = {
  AUTH: {
    MISSING_TOKEN: 'Token não fornecido',
    INVALID_FORMAT: 'Formato do token inválido (Bearer <token>)',
    INVALID_SCHEMA: 'Formato do token inválido (Esquema deve ser Bearer)',
    INVALID_TOKEN: 'Token inválido ou expirado',
    REQUIRED_FIELDS: 'username e password são obrigatórios',
    NAME_USER_PASS_REQUIRED: 'name, username e password são obrigatórios',
    BAD_CREDENTIALS: 'Credenciais inválidas',
    USERNAME_TAKEN: 'Username já em uso',
  },
  POSTS: {
    NOT_FOUND: 'Post não encontrado',
    REQUIRED_FIELDS: 'title e content são obrigatórios',
    FORBIDDEN_AUTHOR: 'Você não é o autor deste post',
    NOTHING_TO_UPDATE: 'Nada para atualizar',
  },
  COMMENTS: {
    POST_NOT_FOUND: 'Post não encontrado',
    REQUIRED_FIELDS: 'content é obrigatório',
    NOT_FOUND: 'Comentário não encontrado',
    FORBIDDEN_AUTHOR: 'Você não é o autor deste comentário',
    NOTHING_TO_UPDATE: 'Nada para atualizar',
  },
  GENERIC: {
    INTERNAL: 'Ocorreu um erro interno',
  }
};