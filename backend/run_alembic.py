import alembic.config
alembic_args = [
    '--raiseerr',
    'revision',
    '--autogenerate',
    '-m', 'Initial schema'
]
alembic.config.main(argv=alembic_args)
