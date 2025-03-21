using my.bookshop as my from '../db/schema';

service ConditionContract {
    @readonly entity Books as projection on my.Books;
}
