declare var manywho: any;
declare var log: any;

manywho.log = (function (manywho) {
    return log.noConflict();
})(manywho);
