var PropTypes = require('prop-types');
/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FixedDataTableBufferedRows.react
 * @typechecks
 */

var React = require('React');
var createReactClass = require('create-react-class');
var FixedDataTableRowBuffer = require('FixedDataTableRowBuffer');
var FixedDataTableRow = require('FixedDataTableRow.react');

var cx = require('cx');
var emptyFunction = require('emptyFunction');
var joinClasses = require('joinClasses');
var translateDOMPositionXY = require('translateDOMPositionXY');

var FixedDataTableBufferedRows = createReactClass({
  displayName: "FixedDataTableBufferedRows",

  propTypes: {
    isScrolling: PropTypes.bool,
    defaultRowHeight: PropTypes.number.isRequired,
    firstRowIndex: PropTypes.number.isRequired,
    firstRowOffset: PropTypes.number.isRequired,
    fixedColumns: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    offsetTop: PropTypes.number.isRequired,
    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowMouseDown: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
    rowClassNameGetter: PropTypes.func,
    rowsCount: PropTypes.number.isRequired,
    rowHeightGetter: PropTypes.func,
    rowPositionGetter: PropTypes.func.isRequired,
    scrollLeft: PropTypes.number.isRequired,
    scrollableColumns: PropTypes.array.isRequired,
    showLastRowBorder: PropTypes.bool,
    width: PropTypes.number.isRequired,
  },

  getInitialState() /*object*/ {
    this._rowBuffer =
      new FixedDataTableRowBuffer(
        this.props.rowsCount,
        this.props.defaultRowHeight,
        this.props.height,
        this._getRowHeight
      );
    return ({
      rowsToRender: this._rowBuffer.getRows(
        this.props.firstRowIndex,
        this.props.firstRowOffset
      ),
    });
  },

  componentWillMount() {
    this._staticRowArray = [];
  },

  componentDidMount() {
    setTimeout(this._updateBuffer, 1000);
    this._isMounted = true;
  },

  componentWillReceiveProps(/*object*/ nextProps) {
    if (nextProps.rowsCount !== this.props.rowsCount ||
        nextProps.defaultRowHeight !== this.props.defaultRowHeight ||
        nextProps.height !== this.props.height) {
      this._rowBuffer =
        new FixedDataTableRowBuffer(
          nextProps.rowsCount,
          nextProps.defaultRowHeight,
          nextProps.height,
          this._getRowHeight
        );
    }
    if (this.props.isScrolling && !nextProps.isScrolling) {
      this._updateBuffer();
    } else {
      this.setState({
        rowsToRender: this._rowBuffer.getRows(
          nextProps.firstRowIndex,
          nextProps.firstRowOffset
        ),
      });
    }
  },

  _updateBuffer() {
    if (this._isMounted) {
      this.setState({
        rowsToRender: this._rowBuffer.getRowsWithUpdatedBuffer(),
      });
    }
  },

  shouldComponentUpdate() /*boolean*/ {
    // Don't add PureRenderMixin to this component please.
    return true;
  },

  componentWillUnmount() {
    this._staticRowArray.length = 0;
    this._isMounted = false;
  },

  render() /*object*/ {
    var props = this.props;
    var rowClassNameGetter = props.rowClassNameGetter || emptyFunction;
    var rowPositionGetter = props.rowPositionGetter;

    var rowsToRender = this.state.rowsToRender;
    this._staticRowArray.length = rowsToRender.length;

    for (var i = 0; i < rowsToRender.length; ++i) {
      var rowIndex = rowsToRender[i];
      var currentRowHeight = this._getRowHeight(rowIndex);
      var rowOffsetTop = rowPositionGetter(rowIndex);

      var hasBottomBorder =
        rowIndex === props.rowsCount - 1 && props.showLastRowBorder;

      this._staticRowArray[i] =
        <FixedDataTableRow
          key={i}
          isScrolling={props.isScrolling}
          index={rowIndex}
          width={props.width}
          height={currentRowHeight}
          scrollLeft={Math.round(props.scrollLeft)}
          offsetTop={Math.round(rowOffsetTop)}
          fixedColumns={props.fixedColumns}
          scrollableColumns={props.scrollableColumns}
          onClick={props.onRowClick}
          onDoubleClick={props.onRowDoubleClick}
          onMouseDown={props.onRowMouseDown}
          onMouseEnter={props.onRowMouseEnter}
          onMouseLeave={props.onRowMouseLeave}
          className={joinClasses(
            rowClassNameGetter(rowIndex),
            cx('public/fixedDataTable/bodyRow'),
            cx({
              'fixedDataTableLayout/hasBottomBorder': hasBottomBorder,
              'public/fixedDataTable/hasBottomBorder': hasBottomBorder,
            })
          )}
          onColumnResize={props.onColumnResize}
          isHoveringResizerKnob={props.isHoveringResizerKnob}
          setHoverState={props.setHoverState}
          isColumnResizing={props.isColumnResizing}
        />;
    }

    var firstRowPosition = props.rowPositionGetter(props.firstRowIndex);

    var style = {
      position: 'absolute',
      pointerEvents: props.isScrolling ? 'none' : 'auto',
    };

    translateDOMPositionXY(
      style,
      0,
      props.firstRowOffset - firstRowPosition + props.offsetTop
    );

    return <div style={style}>{this._staticRowArray}</div>;
  },

  _getRowHeight(/*number*/ index) /*number*/ {
    return this.props.rowHeightGetter ?
      this.props.rowHeightGetter(index) :
      this.props.defaultRowHeight;
  }
});

module.exports = FixedDataTableBufferedRows;
